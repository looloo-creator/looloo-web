import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class AppSideLoginComponent {
  loginFormSubmitted: boolean = false;
  rememberDevice: boolean = false;
  email: string | null = "";
  password: string | null = "";

  constructor(private authService: AuthService) {
    this.rememberDevice = localStorage.getItem('remember_device') ? true : false;
    if (this.rememberDevice) this.email = localStorage.getItem('email'); this.password = localStorage.getItem('password');
    this.loginForm.patchValue({
      email : this.email,
      password : this.password
    });
  }
  loginForm = new FormGroup({
    email: new FormControl(this.email, [Validators.required, Validators.pattern("[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}")]),
    password: new FormControl(this.password, [Validators.required, Validators.minLength(6)]),
  });

  get lf() {
    return this.loginForm.controls;
  }

  login = () => {
    this.loginFormSubmitted = true;
    if (this.loginForm.valid) {
      let requestData = {
        "email": this.lf.email.value,
        "password": this.lf.password.value,
        "remember_device": this.rememberDevice
      }
      this.authService.login(requestData);
    }
  }
  toggle(value: boolean) {
    this.rememberDevice = value;
  }
}
