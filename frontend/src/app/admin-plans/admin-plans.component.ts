import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../store/app.states';

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

import { Subject } from 'rxjs';

import { WeekViewHourSegment } from 'calendar-utils';
import { fromEvent } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { Get as GetReservations } from '../store/actions/reservations.actions';
import { Reservation } from '../models/reservation';
import { Service } from '../models/service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalReservationComponent } from '../modal-reservation/modal-reservation.component';

import { customDateParser, isValidDate } from '../utils';

const colors: any = {
  red: {
    primary: '#cf1b1b',
    secondary: '#900d0d',
  },
  blue: {
    primary: '#0f4c75',
    secondary: '#3282b8',
  },
  green: {
    primary: '#8cba51',
    secondary: '#deff8b',
  },
};

@Component({
  selector: 'app-admin-plans',
  templateUrl: './admin-plans.component.html',
  styleUrls: ['./admin-plans.component.css']
})
export class AdminPlansComponent implements OnInit {

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

  dayStartHour = 6; // Math.max(0, getHours(new Date()) - 2);
  dayEndHour = 22; // Math.min(23, getHours(new Date()) + 2);

  timeTable: any[] = [];
  services: Service[];

  dragToCreateActive = false;
  weekStartsOn = 1;

  currentState$: Observable<any>;
  isLoading: boolean;

  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
  }

  ngOnInit(): void {
    this.store.dispatch(new GetReservations());

    this.currentState$.subscribe((state) => {
      this.isLoading = state.isLoading;
      if (state.business.timeTable){ this.timeTable = JSON.parse(JSON.stringify(state.business.timeTable)) ; }
      if (state.services) { this.services = state.services; }

      if (state.reservations){
        this.events = state.reservations?.map((reservation: Reservation) => {
            return {
              start: new Date(reservation.planned),
              end: addMinutes(
                new Date(reservation.planned),
                reservation.services.map((service: Service) => service.durationM).reduce((a, b) => a + b, 0)
              ),
              title: reservation.services.map((service: Service) => service.name).join() +
                ' Cliente: ' + reservation.customer.fullName +
                ( reservation.note ? ' Note: ' + reservation.note : ''),
              // color: reservation.isApproved === true ? colors.green : colors.blue,
              actions: this.actions,
              allDay: false,
              resizable: {
                beforeStart: true,
                afterEnd: false,
              },
              draggable: true,
              meta: reservation
            };
        });
     }

      // if (this.events.length !== 0) { this.anotherRefresh(); }
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
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
        if (result instanceof Reservation) {
          console.log(result);
        }
      });
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }

  deleteEvent(eventToDelete: CalendarEvent): any {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  fetchReservation(): void{
    // console.log(this.viewDate, this.view);
    // const theLast = this.events.length !== 0 ? this.events[this.events.length - 1].start : null;
    const timestamp = getUnixTime(new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1));
    this.store.dispatch(new GetReservations(timestamp));
  }


  // https://stackblitz.com/edit/angular-7zsn3h?file=demo%2Fcomponent.ts

  /*
  private anotherRefresh(): any {
    this.events = [...this.events];
    this.cdr.detectChanges();
  }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(day => {
      const dayOfMonth = day.date.getDate();
      if (dayOfMonth > 5 && dayOfMonth < 10 && day.inMonth) {
        day.cssClass = 'bg-disabled';
      }
    });
  }
  */

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
