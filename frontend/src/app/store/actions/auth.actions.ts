import { Action } from '@ngrx/store';

export enum AuthActionTypes  {
    REGISTER_START     = '[Auth] Register Start',
    REGISTER_SUCCESS   = '[Auth] Register Success',
    REGISTER_FAILED    = '[Auth] Register Failed',

    LOGIN_START        = '[Auth] Login Start',
    LOGIN_SUCCESS      = '[Auth] Login Success',
    LOGIN_FAILED       = '[Auth] Login Failed'
}


export class Register implements Action {
    readonly type = AuthActionTypes.REGISTER_START;
    constructor(public payload: any) {}
}

export class RegisterSuccess implements Action {
    readonly type = AuthActionTypes.REGISTER_SUCCESS;
    constructor(public payload: any) {}
}

export class RegisterFailed implements Action {
    readonly type = AuthActionTypes.REGISTER_FAILED;
    constructor(public payload: any) {}
}

export class Login implements Action {
    readonly type = AuthActionTypes.LOGIN_START;
    constructor(public payload: any) {}
}

export class LoginSuccess implements Action {
    readonly type = AuthActionTypes.LOGIN_SUCCESS;
    constructor(public payload: any) {}
}

export class LoginFailed implements Action {
    readonly type = AuthActionTypes.LOGIN_FAILED;
    constructor(public payload: any) {}
}

export type All =
    | Register
    | RegisterSuccess
    | RegisterFailed

    | Login
    | LoginSuccess
    | LoginFailed;

