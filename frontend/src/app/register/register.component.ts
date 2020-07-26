import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form: any;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({fullname: '', email: '', username: '', password: '', password2: ''})

  }

  ngOnInit(): void {
  }

  onSubmit(customerData: any): void {
    console.log('Your order has been submitted', customerData);
  }

}
