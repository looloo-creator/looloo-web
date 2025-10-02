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
  memberId: string;
  selectedFile: File;
  file = "";
  selectedFileName = "";
  selectedFileBase64String = "";
  fileremoved = false;

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
            this.selectedFileName = transaction.fileName ?? "";
            this.file = transaction.file ?? "";
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
          const data = new FormData();
          if (this.transactionId) data.append("account_id", this.transactionId);
          if (this.tourId) data.append("tour_id", this.tourId);
          if (this.af.type.value) data.append("type", this.af.type.value);
          if (this.af.date.value) data.append("date", this.af.date.value);
          if (this.af.collected_from.value) data.append("collected_from", this.af.collected_from.value);
          if (this.af.amount.value) data.append("amount", this.af.amount.value);
          if (this.af.reason.value) data.append("reason", this.af.reason.value);
          if (this.fileremoved) data.append("fileremoved", "1");
          if (this.selectedMembers.length > 0) {
            this.selectedMembers.forEach((m: string) => {
              data.append('members[]', m); // repeat the field
            });
          }

          if (this.selectedFile) data.append("file", this.selectedFile, this.selectedFile.name);
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
              this.selectedFileName = "";
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

  fileSelect = (event: any): void => {
    this.fileremoved = true;
    this.selectedFileName = "";
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.fileremoved = false;
      this.selectedFileName = this.selectedFile.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileBase64String = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  preview = () => {
    if (this.selectedFileName) {
      if (this.selectedFile) {
        const newWindow = window.open('', '_blank');
        if (!newWindow) return;

        if (this.selectedFile?.type.startsWith('image/')) {
          newWindow.document.write(`<img src="${this.selectedFileBase64String}" style="max-width:100%;height:auto;">`);
        } else if (this.selectedFile?.type === 'application/pdf') {
          newWindow.document.write(`<iframe src="${this.selectedFileBase64String}" width="100%" height="100%"></iframe>`);
        } else {
          newWindow.document.write(`<a href="${this.selectedFileBase64String}" download="${this.selectedFileName}">Download ${this.selectedFileName}</a>`);
        }
      } else {
        this.accountsService.getfile(this.file).then((fileBlob: any) => {
          const newWindow = window.open('', '_blank');
          if (!newWindow) return;

          const fileExtension = this.selectedFileName.split('.').pop()?.toLowerCase();

          const mimeMap: Record<string, string> = {
            pdf: 'application/pdf',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            bmp: 'image/bmp',
            webp: 'image/webp'
          };

          let blobWithType = fileBlob;
          const correctMime = mimeMap[fileExtension!];
          if (correctMime && fileBlob.type !== correctMime) {
            blobWithType = new Blob([fileBlob], { type: correctMime });
          }

          const fileURL = URL.createObjectURL(blobWithType);

          if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(fileExtension!)) {
            newWindow.document.write(`<img src="${fileURL}" style="max-width:100%;height:auto;">`);
          } else if (fileExtension === 'pdf') {
            newWindow.document.write(`<iframe src="${fileURL}" width="100%" height="100%"></iframe>`);
          } else {
            newWindow.document.write(`<a href="${fileURL}" download="${this.selectedFileName}">Download ${this.selectedFileName}</a>`);
          }

          newWindow.onbeforeunload = () => {
            URL.revokeObjectURL(fileURL);
          };

        })
      }
    }
  }

  removefile = () => {
    this.fileremoved = true;
    this.selectedFileName = "";
  }
}
