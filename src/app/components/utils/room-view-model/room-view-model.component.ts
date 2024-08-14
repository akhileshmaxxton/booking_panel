import { Component, Input } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';


declare var bootstrap: any;
@Component({
  selector: 'app-room-view-model',
  templateUrl: './room-view-model.component.html',
  styleUrl: './room-view-model.component.scss'
})
export class RoomViewModelComponent {
  @Input() roomViewData!: RoomAndRoomStayDetails;

  ngOnChanges() {
    if (this.roomViewData.roomId !== null) {
      console.log('roomViewData internal', this.roomViewData);
      this.openModal();
    }
  }

  openModal() {
    const modalElement = document.getElementById('roomViewModal');
    if (modalElement && this.roomViewData.roomId) {
      console.log("came here")
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
