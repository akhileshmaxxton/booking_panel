import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-room-detail-card-for-home',
  templateUrl: './room-detail-card-for-home.component.html',
  styleUrl: './room-detail-card-for-home.component.scss'
})
export class RoomDetailCardForHomeComponent {
  @Input() room!: RoomAndRoomStayDetails;

  @Output() onViewRoom: EventEmitter<RoomAndRoomStayDetails> = new EventEmitter<RoomAndRoomStayDetails>();
  
  constructor(private router: Router){}

  bookRoom(room: RoomAndRoomStayDetails) {
     this.router.navigate(['/book'], { state: { room } });
  }

  viewRoom(viewRoomData: RoomAndRoomStayDetails) {
    this.onViewRoom.emit(viewRoomData);
    
  }
}
