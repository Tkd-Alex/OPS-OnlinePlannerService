import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '../models/user';

@Injectable()
export class AuthService {
  private BASE_URL = 'http://localhost:1337';

  constructor(private http: HttpClient) {}

  getToken(): string {
    return localStorage.getItem('token');
  }

  login(payload: any): Observable<any> {
    const url = `${this.BASE_URL}/login`;
    return this.http.post<User>(url, payload);
  }

  register(payload: any): Observable<User> {
    const url = `${this.BASE_URL}/register`;
    return this.http.post<User>(url, payload);
  }
}
