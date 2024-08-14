import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomViewModelComponent } from './room-view-model.component';

describe('RoomViewModelComponent', () => {
  let component: RoomViewModelComponent;
  let fixture: ComponentFixture<RoomViewModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoomViewModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomViewModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
