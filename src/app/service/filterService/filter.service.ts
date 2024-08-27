import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../apiService/room-details-api.service';
import { MergeRoomAndRoomDetails } from '../../utils/merge-room-and-room-details.pipe';
import { LocalStorageService } from '../localStorageApi/local-storage.service';
import { UniquePipe } from '../../utils/unique.pipe';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(
    private roomDetailsApiService: RoomDetailsApiService,
    private mergePipe: MergeRoomAndRoomDetails,
    private uniquePipe: UniquePipe,
    private localStorageService: LocalStorageService
  ) {}

  private roomStayDetails$ = new BehaviorSubject<RoomAndRoomStayDetails[]>([]);
  public filters = {
    location: null as number | null,
    price: null as number | null,
    guests: null as number | null,
    days: null as number | null,
    checkInDate: null as string | null,
    checkOutDate: null as string | null,
    isCustomer: true as boolean
  };

  setIsCustomer(isCustomer: boolean) {
    this.filters.isCustomer = isCustomer;
    this.applyFilters();
  }

  getIsCustomer() {
    return this.filters.isCustomer;
  }

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

  setDateRange(checkIn: string, checkOut: string) {
    this.filters.checkInDate = checkIn;
    this.filters.checkInDate = checkIn;
    this.filters.checkOutDate = checkOut;
    console.log(`Check-in: ${this.filters.checkInDate}, Check-out: ${this.filters.checkOutDate}`);
    // Add your logic to handle the selected date range
  }

  private applyFilters() {
    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe((data) => {
      let mergedData = data;
      mergedData = this.uniquePipe.transform(mergedData, 'roomId')
      
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

      // Retrieve reservations from local storage
    const reservations = this.localStorageService.getAllReservationsFromLocalStorage();

    // Remove booked rooms from the list
    if(this.filters.isCustomer){
      mergedData = mergedData.filter(room => {
        // Find all reservations for the current room
        const roomReservations = reservations.filter((reservation: { roomId: number; }) => reservation.roomId === room.roomId);
      
        // Check if there is a continuous duration available between minStay and maxStay
        let isRoomAvailable = true;
        
        roomReservations.forEach((reservation: { checkOut: { getTime: () => number; }; checkIn: { getTime: () => number; }; }) => {
          const stayDuration = (reservation.checkOut.getTime() - reservation.checkIn.getTime()) / (1000 * 3600 * 24);
      
          // Check if the stay duration fits within the room's minStay and maxStay
          if (stayDuration < room.minStay || stayDuration > room.maxStay) {
            isRoomAvailable = false;
          }
        });
      
        return isRoomAvailable;
      });
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
      days: null,
      checkInDate: null,
      checkOutDate: null,
      isCustomer: true
    };
    this.applyFilters();
  }
}
