import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import * as Constant from '../../common/constants';
import { Service } from '../../models/service';

@Injectable()
export class CustomersService {

  constructor(private http: HttpClient) {}

  get(businessId: number, query: string): Observable<any> {
    let url = `${Constant.API_ENDPOINT}/customers?business_id=${businessId}`;
    if (query) { url += `&q=${query}`; }
    return this.http.get(url);
  }

  update(payload: Service): Observable<any> {
    const url = `${Constant.API_ENDPOINT}/customers`;
    return this.http.put<Service>(url, payload);
  }

  insert(payload: Service): Observable<any> {
    const url = `${Constant.API_ENDPOINT}/customers`;
    return this.http.post<Service>(url, payload);
  }

  delete(id: number, businessId: number): Observable<any> {
    const url = `${Constant.API_ENDPOINT}/customers?id=${id}&business_id=${businessId}`;
    return this.http.delete<Service>(url);
  }
}
