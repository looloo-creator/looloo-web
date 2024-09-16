import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../services/common.service';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard {
  constructor(private commonService: CommonService, private authService: AuthService) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    const authToken = this.authService.getToken();
    if (this.authService.isLoggedIn() && authToken) {
      this.commonService.redirect('/dashboard');
      return false;
    } else {
      if (authToken) {
        await this.authService.verifyToken();
        if (this.authService.isLoggedIn()) {
          this.commonService.redirect('/dashboard');
          return false;
        } else {
          this.authService.logout();
          return true;
        }
      } else {
        return true;
      }
    }
  }
}
