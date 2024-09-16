import { Injectable } from '@angular/core';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn: boolean = false;
  private userRole: string = '';
  private userEmail: string = '';
  public authToken: string = '';

  constructor(private commonService: CommonService) { }

  login(data: any) {
    this.commonService.request("users/login", "POST", data).then((response: any) => {
      if (response.success) {
        if (response.statusCode == "R200" && response.data && response.data.jwt) {
          this.authToken = response.data.jwt;
          this.loggedIn = true
          localStorage.setItem('auth_token', this.authToken);
          if (data.remember_device) {
            localStorage.setItem('email', data.email);
            localStorage.setItem('password', data.password);
            localStorage.setItem('remember_device', data.remember_device);
          } else {
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            localStorage.removeItem('remember_device');
          }
          this.commonService.redirect('/dashboard')
        }
      }
    }).catch((error) => { });
  }
  verifyToken = () => {
    const data = {
      "token": this.getToken()
    }

    return this.commonService.request("users/verify", "POST", data).then((response: any) => {
      if (response.success) {
        if (response.statusCode == "R200" && response.data && response.data.email) {
          this.userEmail = response.data.email;
          this.loggedIn = true
        }else{
          this.logout();
          this.commonService.redirect("/authentication/login");
        }
      } else {
        this.logout();
        this.commonService.redirect("/authentication/login");
      }
    }).catch(error => {
      this.logout();
      this.commonService.redirect("/authentication/login");
    });
  }

  logout(): void {
    this.loggedIn = false;
    this.userRole = '';
    localStorage.removeItem('auth_token');
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getUserRole(): string {
    return this.userRole;
  }
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
