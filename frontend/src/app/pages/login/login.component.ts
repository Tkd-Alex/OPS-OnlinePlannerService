import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../../store/app.state';
import { Login } from '../../store/actions/auth.actions';
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

  currentState$: Observable<any>;
  response: any | null;
  isLoading = false;

  constructor(
    private store: Store<AppState>
  ) {
    this.currentState$ = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.currentState$.subscribe((state) => {
      // this.response = state.response;
      this.isLoading = state.isLoading;
    });
  }

  onSubmit(): void {
    this.store.dispatch(new Login(this.form));
  }

}
