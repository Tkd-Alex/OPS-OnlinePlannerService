import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../../../store/app.state';
import { Logout } from '../../../store/actions/auth.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit{

  authState$: Observable<any>;

  constructor(
    public router: Router,
    private store: Store<AppState>
  ) { this.authState$ = this.store.select(selectAuthState); }

  ngOnInit(): void {}
  logout(): void { this.store.dispatch(new Logout()); }

}
