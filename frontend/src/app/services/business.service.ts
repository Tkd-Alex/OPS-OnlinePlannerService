import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import * as Constant from '../constants';

@Injectable()
export class BusinessService {

  constructor(private http: HttpClient) {}

  get(): Observable<any> {
    const url = `${Constant.API_ENDPOINT}/business`;
    return this.http.get(url);
  }
}
