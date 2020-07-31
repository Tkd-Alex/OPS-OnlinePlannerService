import { Business } from '../../models/business';
import { Service } from '../../models/service';

import * as BusinessAction from '../actions/business.actions';
import * as ServicesAction from '../actions/services.actions';

export type Action = BusinessAction.All | ServicesAction.All;

export interface State {
    isLoading: boolean;
    business: Business | null;
    services: Service[] | null;
    response: any | null;
}

export const initialState: State = {
    isLoading: false,
    business: null,
    services: null,
    response: null
};

function buildService(payload: any): Service{
    const service = new Service();
    service.id = payload.service_id;
    service.name = payload.name;
    service.price = payload.price;
    service.durationM = payload.duration_m;
    service.description = payload.description;
    service.createdBy = payload.created_by;
    service.createdDate = payload.created_date;
    service.updatedDate = payload.updated_date;
    service.updatedBy = payload.updated_by;
    return service;
}

export function reducer(state = initialState, action: Action): State {
    switch (action.type) {
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
        case BusinessAction.GET_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null },
                business: {
                    id: action.payload.business_id,
                    name: action.payload.name,
                    description: action.payload.description,
                    address: action.payload.address,
                    timeTable: action.payload.time_table
                }
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
                services: action.payload.map(service => buildService(service))
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
