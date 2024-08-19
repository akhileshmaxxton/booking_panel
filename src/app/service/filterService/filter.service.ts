import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../apiService/room-details-api.service';
import { MergeRoomAndRoomDetails } from '../../utils/merge-room-and-room-details.pipe';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(
    private roomDetailsApiService: RoomDetailsApiService,
    private mergePipe: MergeRoomAndRoomDetails
  ) {}

  private roomStayDetails$ = new BehaviorSubject<RoomAndRoomStayDetails[]>([]);
  private filters = {
    location: null as number | null,
    price: null as number | null,
    guests: null as number | null,
    days: null as number | null
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

  setDaysFilter(days: number | null) {
    this.filters.days = days;
    this.applyFilters();
  }

  private applyFilters() {
    forkJoin({
      roomStayDetails: this.roomDetailsApiService.getRoomStayDetails(),
      roomDetails: this.roomDetailsApiService.getRoomDetails(),
    }).subscribe(({ roomStayDetails, roomDetails }) => {
      let mergedData = this.mergePipe.transform(roomStayDetails, roomDetails);
      
      // Apply filters
      if (this.filters.location !== null) {
        mergedData = mergedData.filter(room => room.locationId === this.filters.location);
      }
      if (this.filters.price !== null) {
        mergedData = mergedData.filter(room => room.pricePerDayPerPerson! <= this.filters.price!);
      }
      if (this.filters.guests !== null) {
        mergedData = mergedData.filter(room => room.guestCapacity! <= this.filters.guests!);
      }
      if(this.filters.days !== null) {
        mergedData = mergedData.filter(room => room.minStay! <= this.filters.days! && room.maxStay! >= this.filters.days!);
      }
      // Emit the filtered data
      this.roomStayDetails$.next(mergedData);
      console.log("Filtered Data:", mergedData);
    });
  }

  getFilteredRoomStayDetails() {
    return this.roomStayDetails$.asObservable();
  }

  resetFilters() {
    this.filters = {
      location: null,
      price: null,
      guests: null,
      days: null
    };
    this.applyFilters();
  }
}
