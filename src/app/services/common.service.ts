import { Injectable } from '@angular/core';
import { HttpService } from './http/http.service';
import { MatSnackBar, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { STATUS } from '../config/index.config';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../pages/common/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  constructor(
    private activeRoute: ActivatedRoute,
    private http: HttpService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private dialog: MatDialog,
  ) { }

  request = (endPoint: string, type = "GET", data: any = {}) => {
    return new Promise((resolve, reject) => {
      if (type == "GET") {
        this.http.get(environment.apiDomain + endPoint).subscribe((response: any) => {
          console.log(response);
          if (response.success) {
            this.showToaster(response.type, response.message);
            resolve(response);
            if(response.statusCode =="R401"){
              localStorage.removeItem('auth_token');
              this.redirect("/authentication/login")
            }
          } else {
            this.openToast("error", response.message);
            reject(response);
          }
        });
      } else {
        this.http.post(environment.apiDomain + endPoint, data).subscribe((response: any) => {
          console.log(response);
          if (response.success) {
            this.showToaster(response.type, response.message);
            resolve(response);
            if(response.statusCode =="R401"){
              localStorage.removeItem('auth_token');
              this.redirect("/authentication/login")
            }
          } else {
            this.openToast("error", response.message);
            reject(response);
          }
        });
      }
    });
  }

  showToaster = (responseType: any, responseMessage: any) => {
    if (responseType === STATUS['INFORMATION']) {
      this.openToast("info", responseMessage);
    } else if (responseType === STATUS['WARNING']) {
      this.openToast("warn", responseMessage);
    } else if (responseType === STATUS['ERROR']) {
      this.openToast("error", responseMessage);
    } else if (responseType === STATUS['SUCCESS']) {
      this.openToast("success", responseMessage);
    }
  }

  openToast = (type: string = "success", message: string, action: any = "Okay!") => {
    let panelClass = ['default-snackbar'];
    if (type == "success") panelClass = ['green-snackbar'];
    if (type == "info") panelClass = ['blue-snackbar'];
    if (type == "warn") panelClass = ['yellow-snackbar'];
    if (type == "error") panelClass = ['red-snackbar'];

    if (message) {
      this._snackBar.open(message, action, {
        panelClass: panelClass,
        verticalPosition: this.verticalPosition,
        duration: 4000,
      });
    }
  }

  confirm = (message: string) => {
    return new Promise((resolve, reject) => {
      const dialogData = new ConfirmDialogModel("Confirmation", message);

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: dialogData,
        width: '450px',
        position: { top: '80px' }
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        resolve(dialogResult);
      });
    })
  }
  modal = (component: any, data: any) => {
    return new Promise((resolve, reject) => {
      this.dialog.open(component, {
        width: '550px',
        data: data
      }).afterClosed().subscribe((dialogResult) => { resolve(dialogResult); });
    });
  }

  redirect(path: string, queryParams: any = false) {
    if (path && this._router.url != path) {
      if (queryParams) {
        this._router.navigate([path], { queryParams: queryParams });
      } else {
        this._router.navigate([path]);
      }
    }
  }

  daydiff = (startDate: Date, endDate: Date) => {
    // Calculate the difference in days using JavaScript Date object
    const timeDifference = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
  }

  queryParams = (): any => {
    let queryParams;
    this.activeRoute.queryParams.subscribe(params => {
      queryParams = params;
    });
    return queryParams;
  }

  logOutAndRedirectLogin = () => {
  }
}
