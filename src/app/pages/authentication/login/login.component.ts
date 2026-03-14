import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class AppSideLoginComponent {
  private msInstance?: PublicClientApplication;
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
    if (!this.msInstance) {
      const msClientId = environment.microsoftClientId;
      const tenant = environment.microsoftTenantId || 'common';
      this.msInstance = new PublicClientApplication({
        auth: {
          clientId: msClientId,
          authority: `https://login.microsoftonline.com/${tenant}`,
          redirectUri: window.location.origin,
        },
        cache: {
          cacheLocation: 'localStorage',
        },
      });
      await this.msInstance.initialize();
    }

    const scopes = ['openid', 'profile', 'email'];
    try {
      // Force account chooser every time
      const loginResult = await this.msInstance.loginPopup({
        scopes,
        prompt: 'select_account',
      });

      // Use the fresh login result token; fallback to token acquisition if needed
      if (loginResult?.idToken) {
        this.authService.socialLogin('microsoft', loginResult.idToken);
        return;
      }

      const account = this.msInstance.getAllAccounts()[0];
      const tokenResult = account
        ? await this.msInstance.acquireTokenSilent({ scopes, account })
        : await this.msInstance.acquireTokenPopup({ scopes, prompt: 'select_account' });

      if (tokenResult?.idToken) {
        this.authService.socialLogin('microsoft', tokenResult.idToken);
      }
    } catch (err) {
      console.error('Microsoft login failed', err);
    }
  }
}
