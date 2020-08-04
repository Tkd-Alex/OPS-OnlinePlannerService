import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../../../store/app.state';

import { Observable } from 'rxjs';

import {
  Get as GetServices,
  Update as UpdateService,
  Insert as InsertService,
  Delete as DeleteService
} from '../../../store/actions/services.actions';
import { Get as GetBusiness } from '../../../store/actions/business.actions';

import { Service } from '../../../models/service';


@Component({
  selector: 'app-admin-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class AdminServicesComponent implements OnInit {

  currentState$: Observable<any>;
  services: Service[];
  dispose: any;

  constructor(
    private store: Store<AppState>,
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
  }

  ngOnInit(): void {
    this.dispose = this.currentState$.subscribe((state) => {
      if (state.isLoading === false){
        if (state.response?.error && this.dispose) { this.dispose.unsubscribe(); }
        else if (state.business === null) { this.store.dispatch(new GetBusiness()); }
        else if (state.business !== null && !state.services ) { this.store.dispatch(new GetServices()); }
        else if (state.services){
          this.services = JSON.parse(JSON.stringify(state.services)) ;
          this.newService();
        }
      }
    });
  }

  saveService(index: number): any{
    if (this.services[index].id !== null) { this.store.dispatch(new UpdateService(this.services[index])); }
    else { this.store.dispatch(new InsertService(this.services[index])); }
  }

  deleteService(index: number): any{
    if (this.services[index].id !== null) { this.store.dispatch(new DeleteService(this.services[index])); }
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
