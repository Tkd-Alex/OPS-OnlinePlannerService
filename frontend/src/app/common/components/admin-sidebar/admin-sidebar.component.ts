import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.state';
import { Logout } from '../../../store/actions/auth.actions';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {

  constructor(
    public router: Router,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {}

  logout(): void {
    this.store.dispatch(new Logout());
  }

}
