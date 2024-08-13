import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDetailsFormComponent } from './booking-details-form.component';

describe('BookingDetailsFormComponent', () => {
  let component: BookingDetailsFormComponent;
  let fixture: ComponentFixture<BookingDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingDetailsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
