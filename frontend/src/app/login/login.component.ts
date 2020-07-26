import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import { Login } from '../store/actions/auth.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: any = {
    username: '',
    password: '',
  };

  getState: Observable<any>;
  errorMessage: string | null;
  isLoading = false;

  constructor(
    private store: Store<AppState>
  ) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.getState.subscribe((state) => {
      this.errorMessage = state.errorMessage;
      this.isLoading = state.isLoading;
    });
  }

  onSubmit(): void {
    this.store.dispatch(new Login(this.form));
  }

}
