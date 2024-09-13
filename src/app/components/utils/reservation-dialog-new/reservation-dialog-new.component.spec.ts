import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationDialogNewComponent } from './reservation-dialog-new.component';

describe('ReservationDialogNewComponent', () => {
  let component: ReservationDialogNewComponent;
  let fixture: ComponentFixture<ReservationDialogNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservationDialogNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationDialogNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
