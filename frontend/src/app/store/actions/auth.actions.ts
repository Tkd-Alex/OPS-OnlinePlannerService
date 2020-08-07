import { Action } from '@ngrx/store';

export const REGISTER_START     = '[Auth] Register Start';
export const REGISTER_SUCCESS   = '[Auth] Register Success';
export const REGISTER_FAILED    = '[Auth] Register Failed';

export const LOGIN_START        = '[Auth] Login Start';
export const LOGIN_SUCCESS      = '[Auth] Login Success';
export const LOGIN_FAILED       = '[Auth] Login Failed';

export const STATUS_START        = '[Auth] Status Start';
export const STATUS_SUCCESS      = '[Auth] Status Success';
export const STATUS_FAILED       = '[Auth] Status Failed';

export const LOGOUT_START        = '[Auth] Logout Start';
export const LOGOUT_SUCCESS      = '[Auth] Logout Success';
export const LOGOUT_FAILED       = '[Auth] Logout Failed';

export class Register implements Action {
    readonly type = REGISTER_START;
    constructor(public payload: any) {}
}

export class RegisterSuccess implements Action {
    readonly type = REGISTER_SUCCESS;
    constructor(public payload: any) {}
}

export class RegisterFailed implements Action {
    readonly type = REGISTER_FAILED;
    constructor(public payload: any) {}
}

export class Login implements Action {
    readonly type = LOGIN_START;
    constructor(public payload: any) {}
}

export class LoginSuccess implements Action {
    readonly type = LOGIN_SUCCESS;
    constructor(public payload: any) {}
}

export class LoginFailed implements Action {
    readonly type = LOGIN_FAILED;
    constructor(public payload: any) {}
}

export class Status implements Action {
    readonly type = STATUS_START;
    constructor() {}
}

export class StatusSuccess implements Action {
    readonly type = STATUS_SUCCESS;
    constructor(public payload: any) {}
}

export class StatusFailed implements Action {
    readonly type = STATUS_FAILED;
    constructor(public payload: any) {}
}

export class Logout implements Action {
    readonly type = LOGOUT_START;
    constructor() {}
}

export class LogoutSuccess implements Action {
    readonly type = LOGOUT_SUCCESS;
    constructor(public payload: any) {}
}

export class LogoutFailed implements Action {
    readonly type = LOGOUT_FAILED;
    constructor(public payload: any) {}
}

export type All =
    | Register
    | RegisterSuccess
    | RegisterFailed

    | Login
    | LoginSuccess
    | LoginFailed

    | Status
    | StatusSuccess
    | StatusFailed

    | Logout
    | LogoutSuccess
    | LogoutFailed;


