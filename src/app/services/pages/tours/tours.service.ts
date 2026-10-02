import { Injectable } from '@angular/core';
import { CommonService } from '../../common.service';

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  toursList: any = [];
  constructor(private commonService: CommonService) { }

  /*** Tours - Start ***/
  /* Tours create and update - Start */
  create = (data: object) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("tours/create", "POST", data).then((response: any) => {
        if (response.success) {
          resolve(response);
        }
      });
    })
  }
  /* Tours create and update - End */

  getTours = async () => {
    try {
      const response: any = await this.commonService.request("tours/list");
      if (response.success && response.statusCode === "R200") {
        this.toursList = response.data || [];
      }
    } catch (error) {
      console.error("Error updating tours list", error);
    }
    return this.toursList;
  }
  /* Get Tours List - End */

  /* Delete Tour - Start */
  deleteTour = (tourId: any) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("tours/delete", "POST", {
        tour_id: tourId
      }).then((response: any) => {
        if (response.success && response.statusCode == "R210") {
          resolve(true);
        }
      });
    })
  }
  /* Delete Tour - Start */
  /*** Tours - End ***/

}
