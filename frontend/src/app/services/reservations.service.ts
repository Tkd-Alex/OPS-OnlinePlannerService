import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import * as Constant from '../constants';
import { Reservation } from '../models/reservation';

@Injectable()
export class ReservationsService {

  constructor(private http: HttpClient) {}

  get(businessId: number): Observable<any> {
    const url = `${Constant.API_ENDPOINT}/reservations?business_id=${businessId}`;
    return this.http.get(url);
  }

  update(payload: Reservation): Observable<any> {
    const url = `${Constant.API_ENDPOINT}/reservations`;
    return this.http.put<Reservation>(url, payload);
  }

  insert(payload: Reservation): Observable<any> {
    const url = `${Constant.API_ENDPOINT}/reservations`;
    return this.http.post<Reservation>(url, payload);
  }

  delete(id: number, businessId: number): Observable<any> {
    const url = `${Constant.API_ENDPOINT}/reservations?id=${id}&business_id=${businessId}`;
    return this.http.delete<Reservation>(url);
  }
}
