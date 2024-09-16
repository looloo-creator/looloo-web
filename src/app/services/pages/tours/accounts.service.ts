import { Injectable } from '@angular/core';
import { CommonService } from '../../common.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  accountsUpdated: any = {};
  accountsList: any = {};
  constructor(private commonService: CommonService) { }

  /*** Accounts - Start ***/
  /* Accounts create and update - Start */
  create = (data: any) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("accounts/create", "POST", data).then((response: any) => {
        if (response.success) {
          this.accountsUpdated[data.tour_id] = false;
          resolve(response);
        }
      });
    })
  }
  /* Accounts create and update - End */

  /* Get Accounts List - End */
  getTransactions = async (tourId: any) => {
    const updateAccountsList = async () => {
      try {
        const response: any = await this.commonService.request("accounts/list", "POST", {
          tour_id: tourId
        });
        if (response.success && response.statusCode === "R200") {
          this.accountsUpdated[tourId] = true;
          this.accountsList[tourId] = response.data;
        }
      } catch (error) {
        console.error("Error updating accounts list", error);
      }
    }

    if (this.accountsUpdated[tourId]) {
      return this.accountsList[tourId];
    } else {
      await updateAccountsList();
      return this.accountsList[tourId];
    }
  }
  /* Get Accounts List - End */

  /* Delete Account - Start */
  deleteTransaction = (tourId: any, accountId: any) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("accounts/delete", "POST", {
        account_id: accountId
      }).then((response: any) => {
        console.log("response", response)
        if (response.success && response.statusCode == "R216") {
          this.accountsUpdated[tourId] = false;
          resolve(true);
        }
      });
    })
  }
  /* Delete Account - Start */
  /*** Accounts - End ***/

}
