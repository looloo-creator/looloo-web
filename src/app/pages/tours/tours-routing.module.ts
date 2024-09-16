import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourslistComponent } from './tourslist/tourslist.component';
import { AddtourComponent } from './addtour/addtour.component';
import { AddmemberComponent } from './addmember/addmember.component';
import { AccountsComponent } from './accounts/accounts.component';
import { ReportComponent } from './report/report.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tours/list',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
      {
        path: 'list',
        component: TourslistComponent,
      },
      {
        path: 'addtour',
        component: AddtourComponent,
      },
      {
        path: 'addmember',
        component: AddmemberComponent,
      },
      {
        path: 'accounts',
        component: AccountsComponent,
      },
      {
        path: 'report',
        component: ReportComponent,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToursRoutingModule { }
