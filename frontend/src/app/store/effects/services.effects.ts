import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Router } from '@angular/router';
import { Actions, Effect, createEffect, ofType } from '@ngrx/effects';

import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent } from 'rxjs';
import { map, filter, scan, mergeMap, switchMap, tap, catchError } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ServicesService } from '../../services/services.service';

import * as ServicesActions from '../actions/services.actions';


@Injectable()
export class ServicesEffects {

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private servicesService: ServicesService,
        private router: Router,
    ) {}

    @Effect()
    Get: Observable<any> = this.actions$.pipe(
        ofType(ServicesActions.GET_START),
        switchMap((action: ServicesActions.Get) =>
            this.servicesService.get().pipe(
                map( (result: any) => new ServicesActions.GetSuccess(result) ),
                catchError( error => of( new ServicesActions.GetFailed(error) ) )
            ))
        );
}
