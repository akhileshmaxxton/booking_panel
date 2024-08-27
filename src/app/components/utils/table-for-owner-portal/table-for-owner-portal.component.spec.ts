import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableForOwnerPortalComponent } from './table-for-owner-portal.component';

describe('TableForOwnerPortalComponent', () => {
  let component: TableForOwnerPortalComponent;
  let fixture: ComponentFixture<TableForOwnerPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableForOwnerPortalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableForOwnerPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
