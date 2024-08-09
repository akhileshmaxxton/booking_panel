import { Component, Input } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';

@Component({
  selector: 'app-room-detail-card-for-home',
  templateUrl: './room-detail-card-for-home.component.html',
  styleUrl: './room-detail-card-for-home.component.scss'
})
export class RoomDetailCardForHomeComponent {
  @Input() room!: RoomAndRoomStayDetails;
}
