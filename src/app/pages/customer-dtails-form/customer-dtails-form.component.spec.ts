import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDtailsFormComponent } from './customer-dtails-form.component';

describe('CustomerDtailsFormComponent', () => {
  let component: CustomerDtailsFormComponent;
  let fixture: ComponentFixture<CustomerDtailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerDtailsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDtailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
