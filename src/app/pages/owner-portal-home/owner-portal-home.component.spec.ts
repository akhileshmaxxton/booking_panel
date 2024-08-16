import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerPortalHomeComponent } from './owner-portal-home.component';

describe('OwnerPortalHomeComponent', () => {
  let component: OwnerPortalHomeComponent;
  let fixture: ComponentFixture<OwnerPortalHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OwnerPortalHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerPortalHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
