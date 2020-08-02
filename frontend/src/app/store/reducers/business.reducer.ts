import { Business } from '../../models/business';
import { Service } from '../../models/service';
import { User } from '../../models/user';
import { Reservation } from '../../models/reservation';

import {
    buildUser,
    buildService,
    buildBusiness,
    buildReservation
} from '../../common/builder';

import * as BusinessAction from '../actions/business.actions';
import * as ServicesAction from '../actions/services.actions';
import * as ReservationsAction from '../actions/reservations.actions';
import { CalendarEvent } from 'angular-calendar';
import { addMinutes } from 'date-fns';

export type Action = BusinessAction.All | ServicesAction.All | ReservationsAction.All;

export interface State {
    isLoading: boolean;
    business: Business | null;
    services: Service[] | null;
    reservations: Reservation[] | null;
    events: CalendarEvent[];
    response: any | null;
}

export const initialState: State = {
    isLoading: false,
    business: null,
    services: null,
    reservations: null,
    events: [],
    response: null
};

export function reducer(state = initialState, action: Action): State {
    switch (action.type) {
        case ReservationsAction.GET_START:
        case ServicesAction.GET_START:
        case ServicesAction.UPDATE_START:
        case ServicesAction.INSERT_START:
        case ServicesAction.DELETE_START:
        case BusinessAction.GET_START:
        case BusinessAction.UPDATE_START: {
            return {
                ...state,
                isLoading: true
            };
        }
        case ReservationsAction.GET_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null },
                reservations: action.payload.map((reservation: any) => buildReservation(reservation))
            };
        }
        case ReservationsAction.INSERT_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null },
                reservations: [ ... state.reservations, buildReservation(action.payload) ]
            };
        }
        case ReservationsAction.UPDATE_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null },
                reservations: state.reservations.map(
                    (value, index) => value.id === action.payload.reversation_id ? buildReservation(action.payload) : value
                )
            };
        }
        case BusinessAction.GET_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null },
                business: buildBusiness(action.payload)
            };
        }
        case BusinessAction.UPDATE_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null},
                business: {
                    id: action.payload.business_id,
                    name: action.payload.name,
                    description: action.payload.description,
                    address: action.payload.address,
                    timeTable: action.payload.time_table
                }
            };
        }
        case ServicesAction.GET_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null },
                services: action.payload.map((service: any) => buildService(service))
            };
        }
        case ServicesAction.UPDATE_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                services: state.services.map(
                    (value, index) => value.id === action.payload.service_id ? buildService(action.payload) : value
                )
            };
        }
        case ServicesAction.DELETE_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null }
            };
        }
        case ServicesAction.INSERT_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                services: [buildService(action.payload)].concat(state.services)
            };
        }
        case ReservationsAction.GET_FAILED:
        case ServicesAction.GET_FAILED:
        case ServicesAction.UPDATE_FAILED:
        case ServicesAction.INSERT_FAILED:
        case ServicesAction.DELETE_FAILED:
        case BusinessAction.GET_FAILED:
        case BusinessAction.UPDATE_FAILED: {
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
