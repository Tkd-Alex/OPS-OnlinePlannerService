import { Component, OnInit, ChangeDetectorRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectBusinessState } from '../../../store/app.states';

import { Observable } from 'rxjs';

import { Get as GetBusiness, Update as UpdateBusiness } from '../../../store/actions/business.actions';

import { Business } from '../../../models/business';
import { NgbTimeAdapter, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';


const pad = (i: number): string => i < 10 ? `0${i}` : `${i}`;
@Injectable()
export class NgbTimeStringAdapter extends NgbTimeAdapter<string> {

  fromModel(value: string| null): NgbTimeStruct | null {
    if (!value) {
      return null;
    }
    const split = value.split(':');
    return {
      hour: parseInt(split[0], 10),
      minute: parseInt(split[1], 10),
      second: parseInt(split[2], 10)
    };
  }

  toModel(time: NgbTimeStruct | null): string | null {
    return time != null ? `${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}` : null;
  }
}

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
