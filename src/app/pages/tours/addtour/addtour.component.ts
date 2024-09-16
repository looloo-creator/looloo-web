import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { ToursService } from 'src/app/services/pages/tours/tours.service';

@Component({
  selector: 'app-addtour',
  templateUrl: './addtour.component.html',
  styleUrls: ['./addtour.component.scss']
})

export class AddtourComponent implements OnInit {
  
  tourFormSubmitted: boolean = false;
  tourId: string | null;

  tourForm = new FormGroup({
    plan: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    planstartdate: new FormControl('', [Validators.required]),
    planenddate: new FormControl('', [Validators.required])
  });

  constructor(
    private commonService: CommonService,
    private tourService: ToursService
  ) { }

  ngOnInit(): void {
    this.tourId = this.commonService.queryParams()?.tour_id ?? null;
    if (this.tourId) {
      this.tourService.getTours().then(tours => {
        const tour = tours.find((tour: any) => tour._id === this.tourId);
        this.tourForm.patchValue({
          plan: tour.plan ?? '',
          description: tour.description ?? '',
          planstartdate: tour.plan_start_date ?? '',
          planenddate: tour.plan_end_date ?? '',
        })
      });
    }
  }

  addTour = () => {
    this.tourFormSubmitted = true;
    if (this.tourForm.valid) {
      this.tourService.create({
        "tour_id": this.tourId,
        "plan": this.atf.plan.value,
        "description": this.atf.description.value,
        "plan_start_date": this.atf.planstartdate.value,
        "plan_end_date": this.atf.planenddate.value
      }).then((response: any) => {
        if (response.statusCode == "R208") {
          this.commonService.redirect("tours/addmember", { tour_id: response.data._id });
        } else if (response.statusCode == "R209") {
          this.commonService.redirect("tours/list");
        }
      })
    }
  }

  get atf() {
    return this.tourForm.controls;
  }

}
