import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearFilterButtonComponent } from './clear-filter-button.component';

describe('ClearFilterButtonComponent', () => {
  let component: ClearFilterButtonComponent;
  let fixture: ComponentFixture<ClearFilterButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClearFilterButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearFilterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
