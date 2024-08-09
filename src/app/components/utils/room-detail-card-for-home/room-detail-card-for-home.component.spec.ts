import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDetailCardForHomeComponent } from './room-detail-card-for-home.component';

describe('RoomDetailCardForHomeComponent', () => {
  let component: RoomDetailCardForHomeComponent;
  let fixture: ComponentFixture<RoomDetailCardForHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoomDetailCardForHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomDetailCardForHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
