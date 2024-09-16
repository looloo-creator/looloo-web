import { Injectable } from '@angular/core';
import { CommonService } from '../../common.service';

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  toursUpdated: boolean = false;
  toursList: any = [];
  constructor(private commonService: CommonService) { }

  /*** Tours - Start ***/
  /* Tours create and update - Start */
  create = (data: object) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("tours/create", "POST", data).then((response: any) => {
        if (response.success) {
          this.toursUpdated = false;
          resolve(response);
        }
      });
    })
  }
  /* Tours create and update - End */

  /* Get Tours List - End */
  getTours = async () => {
    const updateToursList = async () => {
      try {
        const response: any = await this.commonService.request("tours/list");
        if (response.success && response.statusCode === "R200") {
          this.toursUpdated = true;
          this.toursList = response.data;
        }
      } catch (error) {
        console.error("Error updating tours list", error);
      }
    }

    if (this.toursUpdated) {
      return this.toursList;
    } else {
      await updateToursList();
      return this.toursList;
    }
  }
  /* Get Tours List - End */

  /* Delete Tour - Start */
  deleteTour = (tourId: any) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("tours/delete", "POST", {
        tour_id: tourId
      }).then((response: any) => {
        if (response.success && response.statusCode == "R210") {
          this.toursUpdated = false;
          resolve(true);
        }
      });
    })
  }
  /* Delete Tour - Start */
  /*** Tours - End ***/

}
