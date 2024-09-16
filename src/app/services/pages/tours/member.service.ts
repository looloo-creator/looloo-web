import { Injectable } from '@angular/core';
import { CommonService } from '../../common.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  membersUpdated: any = {};
  membersList: any = {};
  constructor(private commonService: CommonService) { }

  /*** Members - Start ***/
  /* Members create and update - Start */
  create = (data: any) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("members/create", "POST", data).then((response: any) => {
        if (response.success) {
          this.membersUpdated[data.tour_id] = false;
          resolve(response);
        }
      });
    })
  }
  /* Members create and update - End */

  /* Get Members List - End */
  getMembers = async (tourId: any) => {
    const updateMembersList = async () => {
      try {
        const response: any = await this.commonService.request("members/list", "POST", {
          tour_id: tourId
        });
        if (response.success && response.statusCode === "R200") {
          this.membersUpdated[tourId] = true;
          this.membersList[tourId] = response.data;
        }
      } catch (error) {
        console.error("Error updating members list", error);
      }
    }

    if (this.membersUpdated[tourId]) {
      return this.membersList[tourId];
    } else {
      await updateMembersList();
      return this.membersList[tourId];
    }
  }
  /* Get Members List - End */

  /* Delete Member - Start */
  deleteMember = (tourId: any, memberId: any) => {
    return new Promise((resolve, reject) => {
      this.commonService.request("members/delete", "POST", {
        member_id: memberId
      }).then((response: any) => {
        if (response.success && response.statusCode == "R213") {
          this.membersUpdated[tourId] = false;
          resolve(true);
        }
      });
    })
  }
  /* Delete Member - Start */
  /*** Members - End ***/

}
