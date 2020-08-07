import { Component, OnInit, ChangeDetectorRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../../../store/app.state';

import { Observable } from 'rxjs';

import { Get as GetBusiness, Update as UpdateBusiness } from '../../../store/actions/business.actions';

import { Business } from '../../../models/business';
import { NgbTimeAdapter } from '@ng-bootstrap/ng-bootstrap';

import { NgbTimeStringAdapter } from '../../../common/injectable';


@Component({
  selector: 'app-admin-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css'],
  providers: [{provide: NgbTimeAdapter, useClass: NgbTimeStringAdapter}]
})
export class AdminBusinessComponent implements OnInit {

  currentState$: Observable<any>;
  business: Business;
  timeTable: any[] = [];

  activeTab = 1;

  constructor(
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
    this.currentState$ = this.store.select(selectBusinessState);
  }

  ngOnInit(): void {
    if (!this.business) { this.store.dispatch(new GetBusiness()) };

    this.currentState$.subscribe((state) => {
      this.business = { ... state.business};
      if (this.business.timeTable){ this.timeTable = JSON.parse(JSON.stringify(this.business.timeTable)) ; }
    });
  }

  save(): any{
    this.store.dispatch(new UpdateBusiness({ ... this.business, timeTable: this.timeTable }));
  }

}
