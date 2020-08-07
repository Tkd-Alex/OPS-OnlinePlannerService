import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Actions, Effect, createEffect, ofType } from '@ngrx/effects';

import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent } from 'rxjs';
import { map, filter, scan, mergeMap, switchMap, tap, catchError } from 'rxjs/operators';

import { AuthService } from '../../providers/http-api/auth.service';

import { Reset } from '../actions/business.actions';
import * as AuthActions from '../actions/auth.actions';
import { AppState } from '../app.state';


@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private router: Router,
        private store: Store<AppState>
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
    Status: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.STATUS_START),
        switchMap((action: AuthActions.Status) => {
            return this.authService.status().pipe(
                map( (result: any) => new AuthActions.StatusSuccess(result) ),
                catchError( error => of( new AuthActions.StatusFailed(error) ) )
            );
        })
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

    @Effect()
    Logout: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.LOGOUT_START),
        switchMap((action: AuthActions.Logout) => {
            return this.authService.logout().pipe(
                map( (result: any) => new AuthActions.LogoutSuccess(result) ),
                catchError( error => of( new AuthActions.LogoutFailed(error) ) )
            );
        })
    );

    @Effect({ dispatch: false })
    LoginSuccess: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.LOGIN_SUCCESS),
        tap((payload) => {
            localStorage.setItem('token', payload.payload.token);
            this.router.navigateByUrl(!payload.payload.user.isAdmin ? '/dashboard' : '/admin');
        })
    );

    @Effect({ dispatch: false })
    LogoutSuccess: Observable<any> = this.actions$.pipe(
        ofType(AuthActions.LOGOUT_SUCCESS),
        tap((payload) => {
            this.store.dispatch(new Reset());
            localStorage.clear();
            this.router.navigateByUrl('/home');
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
