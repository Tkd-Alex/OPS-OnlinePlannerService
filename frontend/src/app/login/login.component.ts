import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: any;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({username: '', password: ''});
  }

  ngOnInit(): void {
  }

  onSubmit(customerData: any): void {
    console.log('Your order has been submitted', customerData);
  }

}
