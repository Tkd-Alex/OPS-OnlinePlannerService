import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Service } from '../../../models/service';
import { Reservation } from '../../../models/reservation';


import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { isValidDate, dateToString, makeEqualServicesArray, changeState } from '../../utils';
// declare var $: any;

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

@Component({
  selector: 'app-modal-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ModalReservationComponent implements OnInit{

  isNew = true;

  reservationServices: Service[] = [];
  @Input() services: Service[];
  @Input() timeTable: any[] = [];

  @Input() date?: Date;
  @Input() reservation?: Reservation;

  dateForBootstrap: NgbDateStruct;
  timeForBootstrap: any;

  totalDuration = 0;
  totalPrice = 0;

  constructor(
    private toastr: ToastrService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void{

    if (!this.reservation){
      this.reservation = new Reservation();
      this.reservation.services = [];

      this.dateForBootstrap = {
        year: this.date.getFullYear(),
        month: this.date.getMonth() + 1,
        day: this.date.getDate()
      };
      this.timeForBootstrap = {
        hour: this.date.getHours(),
        minute: this.date.getMinutes()
      };
    }else {
      this.isNew = false;
      this.dateForBootstrap = {
        year: new Date(this.reservation.start).getFullYear(),
        month: new Date(this.reservation.start).getMonth() + 1,
        day: new Date(this.reservation.start).getDate()
      };
      this.timeForBootstrap = {
        hour: new Date(this.reservation.start).getHours(),
        minute: new Date(this.reservation.start).getMinutes()
      };

      this.reservationServices = this.reservation.services.map((service: Service) => (({ ... service, id: service.serviceId })));
      this.updateTotal();
    }

    /*
    $(document).ready(() => {
      const modalContent: any = $('.modal-content');
      const modalHeader = $('.modal-header');
      modalHeader.addClass('cursor-all-scroll');
      modalContent.draggable({
          handle: '.modal-header'
      });
    });
    */
  }

  _changeState(state: string): void{ this.reservation = changeState(state, this.reservation); }

  updateTotal(): void{
    this.totalDuration = this.reservation.services.map((service: Service) => service.durationM).reduce((a, b) => a + b, 0);
    this.totalPrice = this.reservation.services.map((service: Service) => service.price).reduce((a, b) => a + b, 0);
  }

  save(): void{
    // new Date(year, month, day, hours, minutes, seconds, milliseconds)
    const date = new Date(
      this.dateForBootstrap.year,
      this.dateForBootstrap.month - 1,
      this.dateForBootstrap.day,
      this.timeForBootstrap.hour,
      this.timeForBootstrap.minute,
    );

    if (isValidDate(date, this.timeTable) === false){
      this.toastr.error('La data selezionata non e\' valida in quanto il negozio sembra essere chiuso', 'Ops!');
    }
    else{
      if (this.reservation.services.length === 0){
        this.reservation.services = this.reservationServices.map((service: Service) => ({... service, serviceId: service.id, id: null}));
      } else {
        this.reservation.services = makeEqualServicesArray(this.reservationServices, this.reservation.services, 'push');
        this.reservation.services = makeEqualServicesArray(this.reservation.services, this.reservationServices, 'slice');
      }

      this.reservation.start = dateToString(date);
      this.reservation.end = dateToString(addMinutes(
        new Date(date),
        this.reservation.services.map((service: Service) => service.durationM).reduce((a, b) => a + b, 0)
      ));

      this.activeModal.close(this.reservation);
    }
  }


}
