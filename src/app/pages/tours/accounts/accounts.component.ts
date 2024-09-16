import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { AccountsService } from 'src/app/services/pages/tours/accounts.service';
import { MemberService } from 'src/app/services/pages/tours/member.service';
import { ToursService } from 'src/app/services/pages/tours/tours.service';
import { PreviewComponent } from './preview/preview.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {

  tours: any = [];
  members: any = [];
  selectedMembers: any = [];
  selectedMembersName: any = [];
  accountsFormSubmitted: boolean = false;
  isAllSelected: boolean = false;
  transactionId: string | null;
  tourId: string | null;
  tourName: string = '';
  preview: boolean = false;
  memberId: string;

  accountsForm = new FormGroup({
    type: new FormControl('collection', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    collected_from: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required]),
    reason: new FormControl('', [Validators.required])
  });

  constructor(
    private commonService: CommonService,
    private tourService: ToursService,
    private memberService: MemberService,
    private accountsService: AccountsService,
  ) { }

  ngOnInit(): void {

    this.tourId = this.commonService.queryParams()?.tour_id ?? null;
    this.memberId = this.commonService.queryParams()?.member_id ?? null;
    if (!this.tourId) {
      this.commonService.redirect('tours/list')
    } else {
      this.tourService.getTours().then(tours => {
        this.tours = tours;
        this.tourName = tours.find((tour: any) => tour._id == this.tourId).plan;
      });
      this.transactionId = this.commonService.queryParams()?.transaction_id ?? null;
      this.loadMembers()
      if (this.transactionId) {
        this.memberService.getMembers(this.tourId).then(members => {
          this.members = members;
          this.accountsService.getTransactions(this.tourId).then((response: any) => {
            let transaction = response.find((transaction: any) => transaction._id == this.transactionId);
            this.accountsForm.patchValue({
              type: transaction.type,
              date: transaction.date,
              collected_from: transaction.collected_from,
              amount: transaction.amount,
              reason: transaction.reason,
            });
            this.transactionTypeChange();
            (transaction.members).forEach((memberId: string) => {
              this.selectMember(memberId, true)
            });
          });
        })
      } else if (this.memberId) {
        this.memberService.getMembers(this.tourId).then(members => {
          this.members = members;
          this.selectMember(this.memberId, true);
          this.accountsForm.patchValue({ collected_from: this.memberId });
        });
      }
    }
  }
  loadMembers = () => {
    if (this.tourId) {
      this.memberService.getMembers(this.tourId).then(members => {
        this.members = members;
        this.selectAll(false);
      });
      this.accountsFormSubmitted = false;
    }
  }
  addDetail = () => {
    this.accountsFormSubmitted = true;
    if (this.accountsForm.valid && this.selectedMembers.length !== 0) {
      this.commonService.modal(PreviewComponent, {
        tourName: this.tourName,
        date: this.af.date.value,
        type: this.af.type.value,
        collectedFrom: this.af.collected_from.value ? this.members.find((member: any) => member._id == this.af.collected_from.value)?.name : null,
        amount: Number(this.af.amount.value).toFixed(2),
        shares: `${this.selectedMembers.length} Share(s)`,
        sharePartners: this.selectedMembersName.join(", "),
        shareAmount: (Number(this.af.amount.value) / this.selectedMembers.length).toFixed(2)
      }).then((modalResponse: any) => {
        if (modalResponse && modalResponse.confirm) {
          const data = {
            account_id: this.transactionId,
            tour_id: this.tourId,
            type: this.af.type.value,
            date: this.af.date.value,
            collected_from: this.af.collected_from.value,
            amount: this.af.amount.value,
            reason: this.af.reason.value,
            members: this.selectedMembers
          }
          this.accountsService.create(data).then((response: any) => {
            if (response.statusCode == "R214" || response.statusCode == "R215") {
              this.accountsFormSubmitted = false;
              this.selectedMembers = [];
              this.accountsForm.patchValue({
                date: '',
                collected_from: '',
                amount: '',
                reason: '',
              });
              this.selectAll(false);
              this.transactionId = null;
              if (modalResponse.redirection) {
                let queryParams: Record<string, any> = { tour_id: this.tourId };
                if (this.memberId) { queryParams = { member_id: this.memberId, ...queryParams } }
                this.commonService.redirect("tours/report", queryParams);
              }
            }
          })
        }
      });
    } else {
      console.log(this.af, this.selectedMembers)
    }
  }

  get af() {
    return this.accountsForm.controls;
  }

  selectAll = (isChecked: boolean) => {
    this.isAllSelected = isChecked;
    this.members.forEach((element: any) => {
      element['checked'] = isChecked;
    });
    this.selectedMembers = this.members.filter((member: any) => member.checked).map((member: any) => member._id);
    this.selectedMembersName = this.members.filter((member: any) => member.checked).map((member: any) => member.name);
  }
  selectMember = (memberId: string, isChecked: boolean) => {
    this.members.find((member: any) => member._id == memberId)['checked'] = isChecked;
    const checkedCount = this.members.filter((member: any) => member.checked).length;
    this.isAllSelected = (checkedCount == this.members.length)
    this.selectedMembers = this.members.filter((member: any) => member.checked).map((member: any) => member._id)
    this.selectedMembersName = this.members.filter((member: any) => member.checked).map((member: any) => member.name);
  }
  transactionTypeChange = () => {
    if (this.af.type.value === "collection") {
      this.accountsForm.get("collected_from")?.setValidators([Validators.required]);
    } else {
      this.accountsForm.get("collected_from")?.clearValidators();
    }
    this.accountsForm.updateValueAndValidity();
    if (this.af.type.value != "collection") { this.accountsForm.patchValue({ collected_from: null }) };
    this.accountsFormSubmitted = false;
  }
}
