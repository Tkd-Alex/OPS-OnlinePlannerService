import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Reservation } from '../models/reservation';
import { Service } from '../models/service';

import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { isValidDate } from '../utils';
// declare var $: any;

@Component({
  selector: 'app-modal-reservation',
  templateUrl: './modal-reservation.component.html',
  styleUrls: ['./modal-reservation.component.css']
})
export class ModalReservationComponent implements OnInit{

  @Input() date: Date;
  @Input() services: Service[];
  @Input() timeTable: any[] = [];

  reservation: Reservation;

  dateForBootstrap: NgbDateStruct;
  timeForBootstrap: any;

  totalDuration = 0;
  totalPrice = 0;

  constructor(
    private toastr: ToastrService,
    public activeModal: NgbActiveModal
  ) {
    this.reservation = new Reservation();
    this.reservation.services = [];
  }

  ngOnInit(): void{
    console.log(this.date);
    this.dateForBootstrap = {
      year: this.date.getFullYear(),
      month: this.date.getMonth() + 1,
      day: this.date.getDate()
    };
    this.timeForBootstrap = {
      hour: this.date.getHours(),
      minute: this.date.getMinutes()
    };

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

    console.log(date, this.timeTable);

    if (isValidDate(date, this.timeTable) === false){
      this.toastr.error('La data selezionata non e\' valida in quanto il negozio sembra essere chiuso', 'Ops!');
    }
    else{
      this.reservation.planned = date.toISOString();
      this.activeModal.close(this.reservation);
    }
  }


}
