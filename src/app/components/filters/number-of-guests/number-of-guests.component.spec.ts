import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberOfGuestsComponent } from './number-of-guests.component';

describe('NumberOfGuestsComponent', () => {
  let component: NumberOfGuestsComponent;
  let fixture: ComponentFixture<NumberOfGuestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumberOfGuestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumberOfGuestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
