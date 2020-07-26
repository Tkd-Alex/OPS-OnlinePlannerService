import { User } from '../../models/user';
import { AuthActionTypes, All } from '../actions/auth.actions';

export interface State {
    isLoading: boolean;
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    errorMessage: string | null;
}

export const initialState: State = {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    token: null,
    errorMessage: null
};

export function reducer(state = initialState, action: All): State {
    switch (action.type) {
        case AuthActionTypes.REGISTER_START:
        case AuthActionTypes.LOGIN_START: {
            return {
                ...state,
                isLoading: true,
                errorMessage: null
            };
        }
        case AuthActionTypes.REGISTER_SUCCESS:
        case AuthActionTypes.LOGIN_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                errorMessage: null
            };
        }
        case AuthActionTypes.REGISTER_FAILED:
        case AuthActionTypes.LOGIN_FAILED: {
            return {
                ...state,
                isLoading: false,
                errorMessage: action.payload
            };
        }
        default: {
            return state;
        }
    }
}
