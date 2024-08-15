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
      this.openModal();
    }
  }

  openModal() {
    const modalElement = document.getElementById('roomViewModal');
    if (modalElement && this.roomViewData.roomId) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
