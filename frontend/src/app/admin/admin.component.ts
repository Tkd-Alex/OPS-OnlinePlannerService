import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../store/app.states';

import { Observable } from 'rxjs';

import { Get as GetBusiness } from '../store/actions/business.actions';
import { Get as GetServices } from '../store/actions/services.actions';

import { Business } from '../models/business';
import { Service } from '../models/service';

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

  constructor(
    private store: Store<AppState>
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
    let service: Service = new Service();
    service.id = null;
    service.name = '';
    service.price = 0.00;
    service.description = '';
    this.services.push(service);
  }

}
