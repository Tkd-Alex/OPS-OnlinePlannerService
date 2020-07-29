import { User } from '../../models/user';
import * as AuthAction from '../actions/auth.actions';

export interface State {
    isLoading: boolean;
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    response: any | null;
}

export const initialState: State = {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    token: null,
    response: null
};

export function reducer(state = initialState, action: AuthAction.All): State {
    switch (action.type) {
        case AuthAction.REGISTER_START:
        case AuthAction.LOGIN_START: {
            return {
                ...state,
                isLoading: true
            };
        }
        case AuthAction.REGISTER_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: {
                    error: false,
                    message: action.payload.message
                }
            };
        }
        case AuthAction.LOGIN_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                response: {
                    error: false,
                    message: action.payload.message
                }
            };
        }
        case AuthAction.REGISTER_FAILED:
        case AuthAction.LOGIN_FAILED: {
            return {
                ...state,
                isLoading: false,
                response: {
                    error: true,
                    message: action.payload.error.message
                }
            };
        }
        default: {
            return state;
        }
    }
}
