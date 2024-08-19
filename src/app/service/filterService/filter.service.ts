import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() { }

  private roomStayDetails$ = new BehaviorSubject<RoomAndRoomStayDetails[]>([]);
  private filters = {
    location: null as number | null,
    price: null as number | null,
    guests: null as number | null,
  };

  setRoomStayDetails(details: RoomAndRoomStayDetails[]) {
    this.roomStayDetails$.next(details);
    this.applyFilters();
  }

  setLocationFilter(locationId: number | null) {
    this.filters.location = locationId;
    this.applyFilters();
  }

  setPriceFilter(price: number | null) {
    this.filters.price = price;
    this.applyFilters();
  }

  setGuestsFilter(guests: number | null) {
    this.filters.guests = guests;
    this.applyFilters();
  }

  private applyFilters() {
    let filteredData = [...this.roomStayDetails$.getValue()];
    
    if (this.filters.location !== null) {
      filteredData = filteredData.filter(room => room.locationId! === this.filters.location!);
    }
    
    if (this.filters.price !== null) {
      // Implement price filter logic
      filteredData = filteredData.filter(room => room?.pricePerDayPerPerson! <= this.filters.price!);
    }

    if (this.filters.guests !== null) {
      // Implement guests filter logic
      filteredData = filteredData.filter(room => room?.guestCapacity! >= this.filters.guests!);
    }

    // Emit the filtered data
    this.roomStayDetails$.next(filteredData);
  }

  getFilteredRoomStayDetails() {
    return this.roomStayDetails$.asObservable();
  }
}
