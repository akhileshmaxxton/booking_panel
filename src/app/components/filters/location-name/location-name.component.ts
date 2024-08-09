import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';

@Component({
  selector: 'app-location-name',
  templateUrl: './location-name.component.html',
  styleUrl: './location-name.component.scss'
})
export class LocationNameComponent {
  @Input() roomDetailsForFilter!: RoomAndRoomStayDetails[];

  @Output() locationChanged: EventEmitter<number> = new EventEmitter<number>();
  selectedLocation?: number;

  onLocationChange(value: string): void {
    this.selectedLocation =parseInt(value);
    this.locationChanged.emit(this.selectedLocation);
  }
}
