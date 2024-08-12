import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberOfDaysComponent } from './number-of-days.component';

describe('NumberOfDaysComponent', () => {
  let component: NumberOfDaysComponent;
  let fixture: ComponentFixture<NumberOfDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumberOfDaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumberOfDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
