import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourslistComponent } from './tourslist.component';

describe('TourslistComponent', () => {
  let component: TourslistComponent;
  let fixture: ComponentFixture<TourslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TourslistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
