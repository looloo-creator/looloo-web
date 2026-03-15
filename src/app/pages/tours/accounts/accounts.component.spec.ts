import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { AccountsComponent } from './accounts.component';
import { CommonService } from 'src/app/services/common.service';
import { ToursService } from 'src/app/services/pages/tours/tours.service';
import { MemberService } from 'src/app/services/pages/tours/member.service';
import { AccountsService } from 'src/app/services/pages/tours/accounts.service';

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;

  const commonServiceMock = {
    queryParams: () => ({}),
    redirect: jasmine.createSpy('redirect'),
    modal: () => Promise.resolve({ confirm: false }),
    daydiff: () => 0,
  } as Partial<CommonService>;

  const toursServiceMock = {
    getTours: () => Promise.resolve([]),
  } as Partial<ToursService>;

  const memberServiceMock = {
    getMembers: () => Promise.resolve([]),
  } as Partial<MemberService>;

  const accountsServiceMock = {
    getTransactions: () => Promise.resolve([]),
    create: () => Promise.resolve({ statusCode: 'R214' }),
    getfile: () => Promise.resolve(new Blob()),
  } as Partial<AccountsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountsComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatSnackBarModule,
        MatDialogModule,
      ],
      providers: [
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ToursService, useValue: toursServiceMock },
        { provide: MemberService, useValue: memberServiceMock },
        { provide: AccountsService, useValue: accountsServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
