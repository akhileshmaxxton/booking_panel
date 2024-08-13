import { Component, Input } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-room-detail-card-for-home',
  templateUrl: './room-detail-card-for-home.component.html',
  styleUrl: './room-detail-card-for-home.component.scss'
})
export class RoomDetailCardForHomeComponent {
  @Input() room!: RoomAndRoomStayDetails;
  
  constructor(private router: Router){}

  bookRoom(room: RoomAndRoomStayDetails) {
     this.router.navigate(['/book'], { state: { room } });
  }

  viewRoom(room: RoomAndRoomStayDetails) {
    
  }
}
