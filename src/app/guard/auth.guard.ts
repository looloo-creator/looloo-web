import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common.service';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private commonService: CommonService, private authService: AuthService) {

  }
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    const authToken = this.authService.getToken();
    if (this.authService.isLoggedIn() && authToken) {
      return true;
    } else {
      if (authToken) {
        await this.authService.verifyToken();
        if (this.authService.isLoggedIn()) {
          return true;
        } else {
          return false;
        }
      } else {
        this.commonService.redirect('/authentication/login');
        return false;
      }
    }

  }

}
