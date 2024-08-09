import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPortalHomeComponent } from './customer-portal-home.component';

describe('CustomerPortalHomeComponent', () => {
  let component: CustomerPortalHomeComponent;
  let fixture: ComponentFixture<CustomerPortalHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerPortalHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerPortalHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
