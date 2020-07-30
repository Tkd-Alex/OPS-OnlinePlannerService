import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../store/app.states';

import { Observable } from 'rxjs';

import { Get as GetBusiness, Update as UpdateBusiness } from '../store/actions/business.actions';
import { Get as GetServices } from '../store/actions/services.actions';

import { Business } from '../models/business';
import { Service } from '../models/service';

import {
  CalendarEvent,
  CalendarEventTitleFormatter,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
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
} from 'date-fns';

import { Subject } from 'rxjs';

import { WeekViewHourSegment } from 'calendar-utils';
import { fromEvent } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

function floorToNearest(amount: number, precision: number): number {
  return Math.floor(amount / precision) * precision;
}

function ceilToNearest(amount: number, precision: number): number {
  return Math.ceil(amount / precision) * precision;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  currentState$: Observable<any>;
  business: Business;
  services: Service[];
  timeTable: any[] = [];

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();

  refresh: Subject<any> = new Subject();
  activeDayIsOpen = true;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="pl-2 pr-2 fa fa-pencil"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="pl-2 pr-2 fa fa-trash"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      color: colors.red,
      actions: this.actions,
      allDay: false,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
      actions: this.actions,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      color: colors.blue,
      allDay: false,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];

  dragToCreateActive = false;
  weekStartsOn: 0 = 0;


  constructor(
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
  }

  ngOnInit(): void {
    this.store.dispatch(new GetBusiness());
    this.store.dispatch(new GetServices());

    this.currentState$.subscribe((state) => {
      // Create a mutable copy , isn't the correct way to use immutable state of ngrx - but, It's ok for the moment
      this.business = { ... state.business};
      if (this.business.timeTable){ this.timeTable = JSON.parse(JSON.stringify(this.business.timeTable)) ; }
      if (state.services){ this.services = JSON.parse(JSON.stringify(state.services)) ; }
    });
  }

  saveService(index: number): any{ console.log(this.services[index]); }
  deleteService(index: number): any{ console.log(this.services[index]); }

  newService(): any{
    const service: Service = new Service();
    service.id = null;
    service.name = '';
    service.price = 0.00;
    service.description = '';
    this.services.push(service);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
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
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  deleteEvent(eventToDelete: CalendarEvent): any {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView): any {
    this.view = view;
  }

  closeOpenMonthViewDay(): any {
    this.activeDayIsOpen = false;
  }

  private anotherRefresh(): any {
    console.log(this.events)
    this.events = [...this.events];
    this.cdr.detectChanges();
  }

  // https://stackblitz.com/edit/angular-7zsn3h?file=demo%2Fcomponent.ts

  startDragToCreate(
    segment: WeekViewHourSegment,
    mouseDownEvent: MouseEvent,
    segmentElement: HTMLElement
  ): any {
    const dragToSelectEvent: CalendarEvent = {
      id: this.events.length,
      title: 'New event',
      start: segment.date,
      meta: {
        tmpEvent: true,
      },
    };
    this.events = [...this.events, dragToSelectEvent];  // ehy
    const segmentPosition = segmentElement.getBoundingClientRect();
    this.dragToCreateActive = true;
    const endOfView = endOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    fromEvent(document, 'mousemove')
      .pipe(
        finalize(() => {
          delete dragToSelectEvent.meta.tmpEvent;
          this.dragToCreateActive = false;
          this.anotherRefresh();
          console.log("Ho finito")
        }),
        takeUntil(fromEvent(document, 'mouseup'))
      )
      .subscribe((mouseMoveEvent: MouseEvent) => {
        const minutesDiff = ceilToNearest(
          mouseMoveEvent.clientY - segmentPosition.top,
          30
        );

        const daysDiff =
          floorToNearest(
            mouseMoveEvent.clientX - segmentPosition.left,
            segmentPosition.width
          ) / segmentPosition.width;

        const newEnd = addDays(addMinutes(segment.date, minutesDiff), daysDiff);
        if (newEnd > segment.date && newEnd < endOfView) {
          dragToSelectEvent.end = newEnd;
        }
        this.anotherRefresh();
      });
  }

  saveBusiness(): any{
    this.store.dispatch(new UpdateBusiness({ ... this.business, timeTable: this.timeTable }));
  }

}
