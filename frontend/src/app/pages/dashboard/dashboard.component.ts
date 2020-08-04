import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState, selectAuthState } from '../../store/app.state';

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
  isSameWeek,
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
} from '../../store/actions/reservations.actions';

import { Get as GetBusiness } from '../../store/actions/business.actions';
import { Get as GetServices } from '../../store/actions/services.actions';

import { Reservation } from '../../models/reservation';
import { Service } from '../../models/service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalReservationComponent } from '../../common/modals/reservation/reservation.component';

import { customDateParser, isValidDate, dateToString, changeState, itsGone, getDayStartEnd } from '../../common/utils';
import { ToastrService } from 'ngx-toastr';

import { CustomEventTitleFormatter } from '../../common/injectable';
import { User } from 'src/app/models/user';
import { Status } from '../../store/actions/auth.actions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  refresh: Subject<any> = new Subject();
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();

  clickedDate: Date;
  clickedColumn: number;

  events: CalendarEvent[] = [];

  dayStartHour = 6;
  dayEndHour = 22;

  timeTable: any[] = [];
  services: Service[];

  weekStartsOn = 1;

  currentState$: Observable<any>;
  authState$: Observable<any>;

  isLoading: boolean;
  dispose: any;

  currentUser: User = null;

  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
    this.authState$ = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.store.dispatch(new Status());
    this.authState$.subscribe((state: any) => {
      if (state.isLoading === false && state.user) { this.currentUser = { ... state.user }; }
    });

    this.dispose = this.currentState$.subscribe((state) => {
      this.isLoading = state.isLoading;
      if (state.isLoading === false){
        if (state.response?.error && this.dispose) { this.dispose.unsubscribe(); }
        else if (state.business === null) { this.store.dispatch(new GetBusiness()); }
        else if (state.business !== null && !state.services ) { this.store.dispatch(new GetServices()); }
        else if (state.business !== null && !state.reservations ) { this.store.dispatch(new GetReservations({})); }
      }

      if (state.business?.timeTable){ this.timeTable = state.business.timeTable ; }  // Local reference please :)
      if (state.services) { this.services = state.services; }  // Local reference please :)
      if (state.reservations && this.currentUser){
        this.events = state.reservations?.map((reservation: Reservation) => {
            const editable = !itsGone(reservation.start) && reservation.customer.id === this.currentUser.id;
            return {
              start: new Date(reservation.start),
              end: new Date(reservation.end),
              title: reservation.customer.id !== this.currentUser.id ?
                '' :
                (
                  this.joinServices(reservation.services) +
                  ' Cliente: ' + reservation.customer.fullName +
                  ( reservation.note ? ' Note: ' + reservation.note : '')
                ),
              color: {
                primary: '#1e90ff',
                secondary: '#d1e8ff',
              },
              actions: [],
              allDay: false,
              resizable: { beforeStart: false, afterEnd: false },
              draggable: editable,
              meta: reservation
            };
        });
        const values = getDayStartEnd(this.timeTable, this.viewDate, this.view === 'week' ? false : true);
        this.dayStartHour = values.min;
        this.dayEndHour = values.max;
     }
    });
  }

  joinServices(services: Service[]): string {
    return services.map((service: Service) => service.name).join(', ');
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void { this.view = CalendarView.Day; }

  newReservation(date: Date): void {
    const modalRef = this.modalService.open(ModalReservationComponent, { size: 'md', centered: false });
    modalRef.componentInstance.date = date;
    modalRef.componentInstance.services = this.services;
    modalRef.componentInstance.timeTable = this.timeTable;
    modalRef.componentInstance.isAdmin = false;
    modalRef.result.then((result) => {
      if (result instanceof Reservation) { this.store.dispatch(new InsertReservation(result)); }
    }).catch((error: any) => { console.log(error); });
  }

  editReservation(reservation: Reservation): void{
    if (reservation.customer.id === this.currentUser.id){
      const modalRef = this.modalService.open(ModalReservationComponent, { size: 'md', centered: false });
      modalRef.componentInstance.reservation = reservation;
      modalRef.componentInstance.services = this.services;
      modalRef.componentInstance.timeTable = this.timeTable;
      modalRef.componentInstance.isAdmin = false;
      modalRef.result.then((result) => {
        if (result instanceof Reservation || typeof(result) === 'object') { this.store.dispatch(new UpdateReservation(result)); }
      }).catch((error: any) => { console.log(error); });
    }
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

  fetchReservation(): void{
    const timestamp = getUnixTime(new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1));
    this.store.dispatch(new GetReservations({timestamp}));
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

