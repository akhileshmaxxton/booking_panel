import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { FilterService } from '../../../service/filterService/filter.service';

@Component({
  selector: 'app-location-name',
  templateUrl: './location-name.component.html',
  styleUrl: './location-name.component.scss'
})
export class LocationNameComponent {
  @Input() roomDetailsForFilter!: RoomAndRoomStayDetails[];

  constructor(private filterService: FilterService) {}

  // @Output() locationChanged: EventEmitter<number> = new EventEmitter<number>();
  // selectedLocation?: number;

  onLocationChange(value: string): void {
    const selectedLocation = parseInt(value);
    this.filterService.setLocationFilter(isNaN(selectedLocation) ? null : selectedLocation);
  }
}
