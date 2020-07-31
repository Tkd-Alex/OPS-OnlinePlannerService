import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../store/app.states';

import { Observable } from 'rxjs';

import {
  Get as GetServices,
  Update as UpdateService,
  Insert as InsertService,
  Delete as DeleteServices
} from '../store/actions/services.actions';
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

  saveService(index: number): any{
    if (this.services[index].id !== null) {
      if (this.services.length > 1 && this.services[0].id === null) {
        alert('Devi salvare o cancellare il nuovo servizio per salvarne altri');
      }
      else { this.store.dispatch(new UpdateService(this.services[index])); }
    }
    else { this.store.dispatch(new InsertService(this.services[index])); }
  }

  deleteService(index: number): any{
    if (this.services[index].id !== null) { this.store.dispatch(new DeleteServices(this.services[index])); }
    else { this.services.splice(index, 1); }
  }

  newService(): any{
    if (this.services.length === 0 || this.services[0].id !== null){
      const service: Service = new Service();
      service.id = null;
      service.name = '';
      service.price = 0.00;
      service.durationM = 0;
      service.description = '';
      // this.services.push(service);
      this.services = [service].concat(this.services);
    }
  }

}
