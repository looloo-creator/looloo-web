import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';

declare const google: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    standalone: false
})
export class AppSideLoginComponent {
  constructor(private authService: AuthService) {}

  private ensureGoogleScriptLoaded(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).google && (window as any).google.accounts) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  async loginWithGoogle() {
    await this.ensureGoogleScriptLoaded();
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        if (response?.credential) {
          this.authService.socialLogin('google', response.credential);
        }
      },
    });
    google.accounts.id.prompt();
  }

  async loginWithMicrosoft() {
    // Microsoft login intentionally disabled
    console.warn('Microsoft login is currently disabled.');
  }
}
