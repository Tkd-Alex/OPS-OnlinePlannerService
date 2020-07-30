import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../store/app.states';

import { Observable } from 'rxjs';

import { Get as GetBusiness, Update as UpdateBusiness } from '../store/actions/business.actions';

import { Business } from '../models/business';

@Component({
  selector: 'app-admin-business',
  templateUrl: './admin-business.component.html',
  styleUrls: ['./admin-business.component.css']
})
export class AdminBusinessComponent implements OnInit {

  currentState$: Observable<any>;
  business: Business;
  timeTable: any[] = [];

  constructor(
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
  }

  ngOnInit(): void {
    this.store.dispatch(new GetBusiness());

    this.currentState$.subscribe((state) => {
      // Create a mutable copy , isn't the correct way to use immutable state of ngrx - but, It's ok for the moment
      this.business = { ... state.business};
      if (this.business.timeTable){ this.timeTable = JSON.parse(JSON.stringify(this.business.timeTable)) ; }
    });
  }

  saveBusiness(): any{
    this.store.dispatch(new UpdateBusiness({ ... this.business, timeTable: this.timeTable }));
  }

}
