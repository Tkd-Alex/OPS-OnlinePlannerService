import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Router } from '@angular/router';
import { Actions, Effect, createEffect, ofType } from '@ngrx/effects';

import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent } from 'rxjs';
import { map, filter, scan, mergeMap, switchMap, tap, catchError } from 'rxjs/operators';

import { AuthService } from '../../providers/http-api/auth.service';

import * as AuthActions from '../actions/auth.actions';


@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private router: Router,
    ) {}

    @Effect()
    Login: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        map((action: AuthActions.Login) => action.payload),
        switchMap((payload =>
            this.authService.login(payload).pipe(
                map( (result: any) => new AuthActions.LoginSuccess(result) ),
                catchError( error => of( new AuthActions.LoginFailed(error) ) )
            ))
        )
    );

    @Effect()
    Register: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.REGISTER_START),
        map((action: AuthActions.Register) => action.payload),
        switchMap((payload =>
            this.authService.register(payload).pipe(
                map( (result: any) => new AuthActions.RegisterSuccess(result) ),
                catchError( error => of( new AuthActions.RegisterFailed(error) ) )
            ))
        )
    );

    @Effect({ dispatch: false })
    LoginSuccess: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.LOGIN_SUCCESS),
        tap((payload) => {
            localStorage.setItem('token', payload.payload.token);
            this.router.navigateByUrl('/dashboard');
        })
    );

    @Effect({ dispatch: false })
    RegisterSuccess: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.REGISTER_SUCCESS)
    );

    @Effect({ dispatch: false })
    Failed: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.LOGIN_FAILED, AuthActions.REGISTER_FAILED)
    );

}
