import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { AccountsService } from 'src/app/services/pages/tours/accounts.service';
import { MemberService } from 'src/app/services/pages/tours/member.service';

@Component({
  selector: 'app-addmember',
  templateUrl: './addmember.component.html',
  styleUrls: ['./addmember.component.scss']
})
export class AddmemberComponent implements OnInit {
  tourId: string | null;
  memberFormSubmitted: boolean = false;
  memberId: String | null;
  members: any = [];
  memberColumns: string[] = ['position', 'name', 'collection', 'expenditure', 'balance', 'action'];
  wallet: any = {};
  transactions: any = [];

  constructor(
    private commonService: CommonService,
    private memberService: MemberService,
    private accountsService: AccountsService
  ) { }

  memberForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });
  get mf() {
    return this.memberForm.controls;
  }

  ngOnInit(): void {
    this.tourId = this.commonService.queryParams()?.tour_id ?? null;
    if (!this.tourId) {
      this.commonService.redirect('tours/list')
    } else {
      this.loadMembers();
    }
  }
  addMember = () => {
    this.memberFormSubmitted = true;
    if (this.memberForm.valid) {
      this.memberService.create({
        tour_id: this.tourId,
        member_id: this.memberId,
        name: this.mf.name.value
      }).then((response: any) => {
        this.memberId = null;
        this.memberForm.patchValue({ name: '' });
        this.memberFormSubmitted = false;
        this.loadMembers();
      })
    }
  }
  editMember = (memberId: String) => {
    this.memberId = memberId;
    this.memberService.getMembers(this.tourId).then(members => {
      const member = members.find((member: any) => member._id === memberId);
      this.memberForm.patchValue({ name: member.name });
    });
  }
  clearMember = () => {
    this.memberId = null;
    this.memberForm.patchValue({ name: '' });
  }
  deleteMember = (memberId: String) => {
    const message = `Are you sure you want to delete?`;
    this.commonService.confirm(message).then(confirm => {
      if (confirm) {
        this.memberService.deleteMember(this.tourId, memberId).then(response => {
          if (response) {
            this.loadMembers();
          }
        })
      }
    })
  }

  loadMembers = () => {
    this.memberService.getMembers(this.tourId).then(data => {
      this.members = [];
      var i = 1;
      this.accountsService.getTransactions(this.tourId).then((transactions: any) => {
        this.transactions = transactions;
        data.forEach((element: any) => {
          this.wallet[element._id] = {};
          this.wallet[element._id]['collection'] = 0;
          this.wallet[element._id]['expenditure'] = 0;
          const memberTransactions = this.transactions.filter((transaction: any) => transaction.members.indexOf(element._id) !== -1);
          memberTransactions.forEach((memberTransaction: any) => {
            if (memberTransaction.type == "collection") {
              this.wallet[element._id]['collection'] = this.wallet[element._id]['collection'] + Number((memberTransaction.amount / memberTransaction.members.length).toFixed(2));
            } else {
              this.wallet[element._id]['expenditure'] = this.wallet[element._id]['expenditure'] + Number((memberTransaction.amount / memberTransaction.members.length).toFixed(2));

              if (element.name == 'Jawahar') {
                console.log(this.wallet[element._id]['expenditure'], memberTransaction.amount, memberTransaction.members.length, Number((memberTransaction.amount / memberTransaction.members.length).toFixed(2)))
              }
            }
          });

          let member: any = {
            position: i++,
            name: element.name,
            collection: this.wallet[element._id]['collection'],
            expenditure: this.wallet[element._id]['expenditure'],
            tour_id: element.tour_id,
            member_id: element._id,
          };
          this.members.push(member);
        });
      })
    });
  }

}
