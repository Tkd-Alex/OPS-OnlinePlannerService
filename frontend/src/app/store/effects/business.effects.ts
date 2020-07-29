import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Router } from '@angular/router';
import { Actions, Effect, createEffect, ofType } from '@ngrx/effects';

import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent } from 'rxjs';
import { map, filter, scan, mergeMap, switchMap, tap, catchError } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { BusinessService } from '../../services/business.service';

import * as BusinessActions from '../actions/business.actions';


@Injectable()
export class BusinessEffects {

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private businessService: BusinessService,
        private router: Router,
    ) {}

    @Effect()
    Get: Observable<any> = this.actions$.pipe(
        ofType(BusinessActions.GET_START),
        switchMap((action: BusinessActions.Get) =>
            this.businessService.get().pipe(
                map( (result: any) => new BusinessActions.GetSuccess(result) ),
                catchError( error => of( new BusinessActions.GetFailed(error) ) )
            ))
        );
}
