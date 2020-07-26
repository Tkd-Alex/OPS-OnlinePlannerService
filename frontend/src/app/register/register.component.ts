import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import { Register } from '../store/actions/auth.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form: any = {
    fullname: '',
    email: '',
    username: '',
    password1: '',
    password2: ''
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
    if (this.form.password1 !== this.form.password2) { this.errorMessage = 'Le due password inserite non coincidono'; }
    else {
      this.errorMessage = null;
      this.store.dispatch(new Register(this.form));
    }
  }

}
