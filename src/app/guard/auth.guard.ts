import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService) {}
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
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
        this.authService.logout();
        return false;
      }
    }
  }
}
