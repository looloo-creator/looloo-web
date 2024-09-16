import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class AppSideRegisterComponent {
  registerFormSubmitted: boolean = false;

  constructor(private commonService: CommonService) {
  }
  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern("[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}")]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get rf() {
    return this.registerForm.controls;
  }

  register = () => {
    this.registerFormSubmitted = true;
    if (this.registerForm.valid) {
      let requestData = {
        "email": this.rf.email.value,
        "password": this.rf.password.value
      }
      this.commonService.request("users/create", "POST", requestData).then((response) => {
        this.registerForm.reset();
        this.rf['email'].setErrors(null);
        this.rf['password'].setErrors(null);
        this.registerFormSubmitted = false;
      }).catch(() => { });
    }
  }
}
