import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../../../store/app.state';

import { Observable } from 'rxjs';

import {
  CalendarEvent,
  CalendarEventTitleFormatter,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarMonthViewBeforeRenderEvent,
  CalendarWeekViewBeforeRenderEvent,
  CalendarDayViewBeforeRenderEvent,
} from 'angular-calendar';

import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  endOfWeek,
  addMinutes,
  getHours,
  set
} from 'date-fns';

import getUnixTime from 'date-fns/getUnixTime';
import isWithinRange from 'date-fns/isWithinInterval';
import isBefore from 'date-fns/isBefore';

import { Subject } from 'rxjs';

import { WeekViewHourSegment } from 'calendar-utils';
import { fromEvent } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import {
  Get as GetReservations,
  Insert as InsertReservation,
  Update as UpdateReservation
} from '../../../store/actions/reservations.actions';

import { Get as GetBusiness } from '../../../store/actions/business.actions';
import { Get as GetServices } from '../../../store/actions/services.actions';

import { Reservation } from '../../../models/reservation';
import { Service } from '../../../models/service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalReservationComponent } from '../../../common/modals/reservation/reservation.component';

import { customDateParser, isValidDate, dateToString } from '../../../common/utils';
import { ToastrService } from 'ngx-toastr';

import { CustomEventTitleFormatter } from '../../../common/injectable';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#fae3e3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#d1e8ff',
  },
  green: {
    primary: '#21ad28',
    secondary: '#e3fae5',
  },
};

@Component({
  selector: 'app-admin-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  providers: [{provide: CalendarEventTitleFormatter, useClass: CustomEventTitleFormatter}],
})
export class AdminPlansComponent implements OnInit {

  refresh: Subject<any> = new Subject();
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();

  clickedDate: Date;
  clickedColumn: number;

  activeDayIsOpen = false;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="pl-1 fa fa-pencil"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="pl-1 fa fa-trash"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  events: CalendarEvent[] = [];

  dayStartHour = 6;
  dayEndHour = 22;

  timeTable: any[] = [];
  services: Service[];

  dragToCreateActive = false;
  weekStartsOn = 1;

  currentState$: Observable<any>;
  isLoading: boolean;
  dispose: any;

  activeTab = 1;

  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
  }

  ngOnInit(): void {

    this.dispose = this.currentState$.subscribe((state) => {
      this.isLoading = state.isLoading;
      if (state.isLoading === false){
        if (state.response?.error && this.dispose) { this.dispose.unsubscribe(); }
        else if (state.business === null) { this.store.dispatch(new GetBusiness()); }
        else if (state.business !== null && !state.services ) { this.store.dispatch(new GetServices()); }
        else if (state.business !== null && !state.reservations ) { this.store.dispatch(new GetReservations()); }
      }

      if (state.business?.timeTable){ this.timeTable = state.business.timeTable ; }  // Local reference please :)
      if (state.services) { this.services = state.services; }  // Local reference please :)
      if (state.reservations){
        this.events = state.reservations?.map((reservation: Reservation) => {
            const editable = isBefore(new Date(), new Date(reservation.start)) ? true : false;
            return {
              start: new Date(reservation.start),
              end: new Date(reservation.end),
              title: reservation.services.map((service: Service) => service.name).join(', ') +
                ' Cliente: ' + reservation.customer.fullName +
                ( reservation.note ? ' Note: ' + reservation.note : ''),
              color: reservation.isApproved === true ? colors.green : colors.blue,
              actions: this.actions,
              allDay: false,
              resizable: { beforeStart: editable, afterEnd: editable },
              draggable: editable,
              meta: reservation
            };
        });
        const values = this.getDayStartEnd(this.view === 'week' ? false : true);
        this.dayStartHour = values.min;
        this.dayEndHour = values.max;
     }
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate) && this.view === 'month') {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) { this.activeDayIsOpen = false; } else { this.activeDayIsOpen = true; }
      this.viewDate = date;
    }
    if (this.activeDayIsOpen === false){ this.view = CalendarView.Day; }
  }

  newReservation(date: Date): void {
    const modalRef = this.modalService.open(ModalReservationComponent, { size: 'lg', centered: false });
    modalRef.componentInstance.date = date;
    modalRef.componentInstance.services = this.services;
    modalRef.componentInstance.timeTable = this.timeTable;
    modalRef.result.then((result) => {
      if (result instanceof Reservation) { this.store.dispatch(new InsertReservation(result)); }
    }).catch((error: any) => { console.log(error); });
  }

  editReservation(event: Reservation): void{
    const modalRef = this.modalService.open(ModalReservationComponent, { size: 'lg', centered: false });
    modalRef.componentInstance.reservation = event;
    modalRef.componentInstance.services = this.services;
    modalRef.componentInstance.timeTable = this.timeTable;
    modalRef.result.then((result) => {
      if (result instanceof Reservation || typeof(result) === 'object') { this.store.dispatch(new UpdateReservation(result)); }
    }).catch((error: any) => { console.log(error); });
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    if (isValidDate(newStart, this.timeTable) === true && isValidDate(newEnd, this.timeTable) === true) {
      this.events = this.events.map((iEvent) => {
        if (iEvent === event) { return { ...event, start: newStart, end: newEnd, }; }
        return iEvent;
      });

      const reservation: Reservation = {... event.meta};
      reservation.start = dateToString(newStart);
      reservation.end = dateToString(newEnd);
      this.store.dispatch(new UpdateReservation(reservation));
    }else {
      this.toastr.error('La data inserita non sembra esser valida. Il negozio e\' chiuso', 'Ops!');
      this.refresh.next();
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.editReservation({
      ... event.meta,
      start: dateToString(event.start),
      end: dateToString(event.end)
    });
  }

  deleteEvent(eventToDelete: CalendarEvent): any {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  fetchReservation(): void{
    const timestamp = getUnixTime(new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1));
    this.store.dispatch(new GetReservations(timestamp));
  }

  disableDayHours(renderEvent: CalendarWeekViewBeforeRenderEvent): void {
    renderEvent.hourColumns.forEach(hourColumn => {
      hourColumn.hours.forEach(hour => {
        hour.segments.forEach(segment => {
          const processed: any = [];
          this.timeTable.map((value: any, index: number) => {
            if ((index + 1) % 7 === segment.date.getDay()){

              ['morning', 'afternoon'].map((type: string) => {

                if (value[type].open !== null && value[type].close !== null){

                  const open = customDateParser(segment.date, value[type].open);
                  const close = customDateParser(segment.date, value[type].close);

                  if (!isWithinRange( segment.date, { start: open, end: close } )){
                    if (processed.indexOf(segment.date) === -1){ segment.cssClass = 'cal-disabled'; }
                  } else {
                    processed.push(segment.date);
                    segment.cssClass = undefined;
                  }
                }
                else { if (processed.indexOf(segment.date) === -1) { segment.cssClass = 'cal-disabled'; } }
              });
            }
          });
        });
      });
    });
  }

  getDayStartEnd(single = true): any {
    const allhours = [];
    const timings = single ? [this.timeTable[this.viewDate.getDay() !== 0 ? this.viewDate.getDay() - 1 : 6]] : this.timeTable;
    timings.forEach((value: any) => {
      ['morning', 'afternoon'].map((type: string) => {
        if (value[type].open !== null && value[type].close !== null){
          allhours.push(parseInt(value[type].open.split(':')[0], 0));
          allhours.push(parseInt(value[type].close.split(':')[0], 0));
        }
      });
    });
    const max = Math.max(...allhours);
    const min = Math.min(...allhours);
    return { min, max };
  }

  handleHourClick(date: Date): void{
    if (isValidDate(date, this.timeTable) === true) { this.newReservation(date); }
  }

  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent): void {
    this.disableDayHours(renderEvent);
  }

  beforeDayViewRender(renderEvent: CalendarDayViewBeforeRenderEvent): void {
    this.disableDayHours(renderEvent);
  }

}
