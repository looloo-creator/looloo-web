import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';

declare const google: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    standalone: false
})
export class AppSideLoginComponent implements AfterViewInit {
  @ViewChild('googleSignInButton', { static: true })
  private googleSignInButton!: ElementRef<HTMLDivElement>;

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

  async ngAfterViewInit() {
    await this.ensureGoogleScriptLoaded();
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      use_fedcm_for_button: true,
      callback: (response: any) => {
        if (response?.credential) {
          this.authService.socialLogin('google', response.credential);
        }
      },
    });
    google.accounts.id.renderButton(this.googleSignInButton.nativeElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: String(Math.min(this.googleSignInButton.nativeElement.clientWidth || 320, 400)),
    });
  }

  async loginWithMicrosoft() {
    // Microsoft login intentionally disabled
    console.warn('Microsoft login is currently disabled.');
  }
}
