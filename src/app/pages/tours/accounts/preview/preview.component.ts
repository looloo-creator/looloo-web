import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-transaction-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent {
  addMoreTransaction: boolean = true;

  tourName: string;
  type: string;
  date: Date;
  collectedFrom: string;
  amount: string;
  shares: string;
  sharePartners: string;
  shareAmount: string | number;

  constructor(public dialogRef: MatDialogRef<PreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.tourName = data.tourName;
    this.date = data.date;
    this.type = data.type;
    this.collectedFrom = data.collectedFrom;
    this.amount = data.amount;
    this.shares = data.shares;
    this.sharePartners = data.sharePartners;
    this.shareAmount = data.shareAmount;
  }

  onConfirm(): void {
    this.dialogRef.close({ confirm: true, redirection: !this.addMoreTransaction });
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
