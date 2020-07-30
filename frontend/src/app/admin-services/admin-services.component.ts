import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../store/app.states';

import { Observable } from 'rxjs';

import { Get as GetServices } from '../store/actions/services.actions';
import { Service } from '../models/service';


@Component({
  selector: 'app-admin-services',
  templateUrl: './admin-services.component.html',
  styleUrls: ['./admin-services.component.css']
})
export class AdminServicesComponent implements OnInit {

  currentState$: Observable<any>;
  services: Service[];

  constructor(
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
  }

  ngOnInit(): void {
    this.store.dispatch(new GetServices());

    this.currentState$.subscribe((state) => {
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

}
