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

export function reducer(state = initialState, action: Action): State {
    switch (action.type) {
        case ServicesAction.GET_START:
        case BusinessAction.GET_START:
        case ServicesAction.UPDATE_START:
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
                services: action.payload.map(service => {
                    return {
                        id: service.service_id,
                        createdBy: service.created_by,
                        name: service.name,
                        price: service.price,
                        description: service.description,
                        createdDate: service.created_date
                    }
                })
            };
        }
        case ServicesAction.UPDATE_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                response: { error: false, message: null}
            };
        }
        case ServicesAction.GET_FAILED:
        case BusinessAction.GET_FAILED:
        case ServicesAction.UPDATE_FAILED:
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
