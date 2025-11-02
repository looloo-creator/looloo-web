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

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      //   this.authService.verifyEmail(token).subscribe({
      //     next: () => (this.isVerified = true),
      //     error: () => (this.isVerified = false),
      //   });
    }

    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  resendEmail() {
    this.resendSubmitted = true;
    if (this.resendForm.invalid) return;

    // this.authService
    //   .resendVerificationEmail(this.resendForm.value.email)
    //   .subscribe({
    //     next: () => alert('Verification email sent successfully'),
    //     error: () => alert('Failed to resend email'),
    //   });
  }
}
