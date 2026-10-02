import { Injectable } from '@angular/core';
import { CommonService } from '../../common.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  accountsList: any = {};
  constructor(private commonService: CommonService) { }

  /*** Accounts - Start ***/
  /* Accounts create and update - Start */
  create = (data: any) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("accounts/create", "POST", data).then((response: any) => {
        if (response.success) {
          resolve(response);
        }
      });
    })
  }
  /* Accounts create and update - End */

  getTransactions = async (tourId: any) => {
    try {
      const response: any = await this.commonService.request("accounts/list", "POST", {
        tour_id: tourId
      });
      if (response.success && response.statusCode === "R200") {
        this.accountsList[tourId] = response.data || [];
      }
    } catch (error) {
      console.error("Error updating accounts list", error);
    }
    return this.accountsList[tourId] || [];
  }
  /* Get Accounts List - End */

  /* Delete Account - Start */
  deleteTransaction = (tourId: any, accountId: any) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("accounts/delete", "POST", {
        account_id: accountId
      }).then((response: any) => {
        if (response.success && response.statusCode == "R216") {
          resolve(true);
        }
      });
    })
  }
  /* Delete Account - Start */

  /* Get File - Start */
  getfile = (file: string) => {
    return new Promise((resolve, reject) => {
      this.commonService.request(`accounts/preview/${file}`, "GET", {}, { responseType: 'blob' }).then((response: any) => {
        resolve(response);
      });
    })
  }
  /* Delete Account - Start */
  /*** Accounts - End ***/

}
