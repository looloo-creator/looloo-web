import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { AccountsService } from 'src/app/services/pages/tours/accounts.service';
import { MemberService } from 'src/app/services/pages/tours/member.service';
import { ToursService } from 'src/app/services/pages/tours/tours.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {

  transactionColumns: string[] = ['position', 'date', 'name', 'shares', 'description', 'amount', 'action'];
  memberTransactionColumns: string[] = ['position', 'date', 'name', 'shares', 'description', 'amount', 'share', 'action'];
  transactions: any = [];
  members: any = [];
  tourId: string;
  tourName: string;
  memberId: string | null;
  memberName: string;
  collection: number = 0;
  expenditure: number = 0;
  constructor(
    private commonService: CommonService,
    private accountsService: AccountsService,
    private tourService: ToursService,
    private memberService: MemberService,
  ) { }

  ngOnInit() {
    this.tourId = this.commonService.queryParams()?.tour_id ?? null;
    if (!this.tourId) {
      this.commonService.redirect('tours/list')
    } else {
      this.tourService.getTours().then((response: any) => {
        this.tourName = response.find((tour: any) => tour._id == this.tourId).plan;
      })
      this.loadTransactions();
      this.memberId = this.commonService.queryParams()?.member_id ?? null;
      if (this.memberId) {
        this.memberService.getMembers(this.tourId).then((members: any) => {
          this.memberName = members.find((member: any) => member._id == this.memberId).name;
        })
      }
    }
  }

  deleteTransaction(tourId: String, transactionId: String) {
    const message = `Are you sure you want to delete?`;
    this.commonService.confirm(message).then(confirm => {
      if (confirm) {
        this.accountsService.deleteTransaction(tourId, transactionId).then(response => {
          if (response) {
            this.loadTransactions();
          }
        })
      }
    })
  }

  loadTransactions = () => {
    this.accountsService.getTransactions(this.tourId).then((data: any) => {
      this.memberService.getMembers(this.tourId).then((response: any) => {
        this.members = response;
        this.transactions = [];
        var i = 1;
        this.collection = 0;
        this.expenditure = 0;
        data.forEach((element: any) => {
          if (this.memberId) {
            if (element.members.indexOf(this.memberId) === -1) { return; }
          }
          let name = element.collected_from ? this.members.find((member: any) => member._id == element.collected_from).name : ''
          let tour: any = {
            position: i++,
            account_id: element._id,
            tour_id: element.tour_id,
            date: new Date(element.date),
            name: name,
            shares: `${element.members.length} Share(s)`,
            description: element.reason,
            amount: element.type == "collection" ? `+ ${(element.amount).toFixed(2)}` : `- ${(element.amount).toFixed(2)}`,
            share_amount: element.type == "collection" ? `+ ${(element.amount / element.members.length).toFixed(2)}` : `- ${(element.amount / element.members.length).toFixed(2)}`,
          };
          if (element.type == "collection") {
            this.collection = this.collection + (this.memberId ? Number((element.amount / element.members.length).toFixed(2)) : Number((element.amount).toFixed(2)));
          } else {
            this.expenditure = this.expenditure + (this.memberId ? Number((element.amount / element.members.length).toFixed(2)) : Number((element.amount).toFixed(2)));
          }
          this.transactions.push(tour);
        });
      });
    });
  }

}
