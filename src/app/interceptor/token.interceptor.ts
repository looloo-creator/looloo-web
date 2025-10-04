import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    let request = req;
    if (token) {
      request = this.addTokenHeader(req, token);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else if (error instanceof HttpErrorResponse && error.status === 403) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    let headersConfig: any = {
      Authorization: `Bearer ${token}`,
    };
    if (!(request.body instanceof FormData)) {
      headersConfig['Content-Type'] = 'application/json';
    }

    return request.clone({ setHeaders: headersConfig });
  }
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return from(this.authService.refreshToken()).pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const newAccessToken = response.data.jwt;
          this.authService.setLoggedIn(true);
          this.authService.storeAccessToken(newAccessToken);
          this.refreshTokenSubject.next(newAccessToken);
          return next.handle(this.addTokenHeader(request, newAccessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenHeader(request, token!)))
      );
    }
  }
}
