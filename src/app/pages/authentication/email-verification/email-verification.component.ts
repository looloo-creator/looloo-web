import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
  standalone: false,
})
export class EmailVerificationComponent implements OnInit {
  isVerified = true;
  resendForm!: FormGroup;
  resendSubmitted = false;
  isLoading = true;
  errormessage = '';
  loaderMessage = 'Verifying your email...';
  successMessage = 'Email Verified Successfully';
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService
        .verifyEmail(token)
        .then((response) => {
          this.successMessage = 'Email Verified Successfully';
          this.isVerified = true;
          this.isLoading = false;
        })
        .catch((error) => {
          this.isVerified = false;
          this.isLoading = false;
          this.errormessage = 'Your verification link is invalid or expired.';
        });
    }

    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  resendEmail() {
    this.resendSubmitted = true;
    if (this.resendForm.invalid) return;

    this.isLoading = true;
    this.loaderMessage = 'Sending Verification Link...';
    this.authService
      .resendVerificationEmail(this.resendForm.value.email)
      .then((response) => {
        this.successMessage = 'Verification Link Sent.';
        this.isVerified = true;
        this.isLoading = false;
      })
      .catch((error) => {
        this.isVerified = false;
        this.isLoading = false;
        this.errormessage = 'Failed to sent.';
        if (error.status === 409) {
          this.isVerified = true;
          this.isLoading = false;
          this.successMessage = 'Email already verified';
        }
      });
  }
}
