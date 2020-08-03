import { Component, OnInit, ChangeDetectorRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../../../store/app.state';

import { Observable } from 'rxjs';

import { Get as GetCustomers } from '../../../store/actions/customers.actions';
import { Get as GetBusiness } from '../../../store/actions/business.actions';
import { Get as GetReservations } from '../../../store/actions/reservations.actions';

import { User } from 'src/app/models/user';
import { Reservation } from 'src/app/models/reservation';
import { Service } from 'src/app/models/service';

import differenceInMinutes from 'date-fns/differenceInMinutes';

@Component({
  selector: 'app-admin-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class AdminCustomersComponent implements OnInit {

  currentState$: Observable<any>;
  customers: User[];
  dispose: any;

  isLoading = false;
  query = '';

  selected: User;
  reservations: Reservation[];

  constructor(
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
  }

  ngOnInit(): void {
    this.dispose = this.currentState$.subscribe((state) => {
      this.isLoading = state.isLoading;
      if (state.isLoading === false){
        if (state.response?.error && this.dispose) { this.dispose.unsubscribe(); }
        else if (state.business === null) { this.store.dispatch(new GetBusiness()); }
        else if (state.business !== null && !state.customers ) { this.store.dispatch(new GetCustomers(this.query)); }
        else {
          if (state.customers){ this.customers = [ ... state.customers ]; }
          if (state.reservations){ this.reservations = [ ... state.reservations ]; }
        }
      }
    });
  }

  handleSearch(event: any): void {
    if ((event.keyCode === 8 && !this.query) ||
        (event.keyCode >= 48 && event.keyCode <= 57) ||
        (event.keyCode >= 65 && event.keyCode <= 90)){
      if (this.isLoading === false){ this.store.dispatch(new GetCustomers(this.query)); }
    }
  }

  joinServices(services: Service[]): string {
    return services.map((service: Service) => service.name).join(', ');
  }

  _differenceInMinutes(start: string, end: string): number{
    return differenceInMinutes(new Date(end), new Date(start));
  }

  select(user: User): void {
    this.selected = user;
    this.store.dispatch(new GetReservations({ customerId: this.selected.id }));
  }

  update(values: any): void{
    if (values.isAdmin) { this.selected = { ... this.selected, isAdmin: values.isAdmin }; }
  }

}
