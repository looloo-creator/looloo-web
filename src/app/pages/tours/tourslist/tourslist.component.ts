import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ToursService } from 'src/app/services/pages/tours/tours.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tourslist.component.html',
  styleUrls: ['./tourslist.component.scss'],
})
export class TourslistComponent implements OnInit {

  tourColumns: string[] = ['position', 'name', 'description', 'action'];
  tours: any = [];
  private datePipe: DatePipe = new DatePipe("en-IN");
  constructor(private tourService: ToursService, private commonService: CommonService) { }

  ngOnInit() {
    this.loadTours();
  }

  deleteTour(tourId: string) {
    const message = `Are you sure you want to delete?`;
    this.commonService.confirm(message).then(confirm => {
      if (confirm) {
        this.tourService.deleteTour(tourId).then(response => {
          if (response) {
            this.loadTours();
          }
        })
      }
    })
  }

  loadTours = () => {
    this.tourService.getTours().then(data => {
      this.tours = [];
      var i = 1;
      data.forEach((element: any) => {
        let tour: { position: number, name: string, description: string | null, tour_id: string, plan_start_date: Date, plan_end_date: Date } = {
          position: i++,
          name: element.plan,
          description: element.description && element.description != '' ? element.description : `${this.commonService.daydiff(new Date(element.plan_start_date), new Date(element.plan_end_date))} Day(s) Trip ${this.datePipe.transform(element.plan_start_date, "shortDate")} to ${this.datePipe.transform(element.plan_end_date, "shortDate")} `,
          plan_start_date: new Date(element.plan_start_date),
          plan_end_date: new Date(element.plan_end_date),
          tour_id: element._id
        };
        this.tours.push(tour);
      });
    });
  }

  redirect = (path: string, queryParams: object | null = null) => {
    this.commonService.redirect(path, queryParams);
  }
}
