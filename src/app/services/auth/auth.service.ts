import { Injectable } from '@angular/core';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn: boolean = false;

  constructor(private commonService: CommonService) {}

  login(data: any) {
    this.commonService
      .request('users/login', 'POST', data)
      .then((response: any) => {
        if (response.success) {
          if (
            response.statusCode == 'R200' &&
            response.data &&
            response.data.jwt
          ) {
            localStorage.setItem('auth_token', response.data.jwt);
            if (data.remember_device) {
              localStorage.setItem('email', data.email);
              localStorage.setItem('password', data.password);
              localStorage.setItem('remember_device', data.remember_device);
            } else {
              localStorage.removeItem('email');
              localStorage.removeItem('password');
              localStorage.removeItem('remember_device');
            }
            window.location.reload();
          }
        }
      })
      .catch((error) => {});
  }

  refreshToken = (): Promise<any> => {
    return this.commonService.request(
      'users/refresh',
      'POST',
      {},
      { withCredentials: true }
    );
  };

  verifyToken = () => {
    return this.commonService.request('verify-login', 'GET').then(() => {
      this.setLoggedIn(true);
    });
  };

  verifyEmail = (token: string) => {
    return this.commonService.request(`users/verifyemail/${token}`, 'GET');
  };

  resendVerificationEmail = (email: string) => {
    return this.commonService.request(`users/send-verification-link`, 'POST', {
      email: email,
    });
  };

  logout(redirect = true): void {
    this.setLoggedIn(false);
    localStorage.removeItem('auth_token');
    if (redirect) {
      this.commonService.redirect('/authentication/login');
    }
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  setLoggedIn(isLoggedIn: boolean) {
    this.loggedIn = isLoggedIn;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  storeAccessToken(token: string) {
    localStorage.setItem('auth_token', token);
  }
}
