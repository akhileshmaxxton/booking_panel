import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../apiService/room-details-api.service';
import { MergeRoomAndRoomDetails } from '../../utils/merge-room-and-room-details.pipe';
import { LocalStorageService } from '../localStorageApi/local-storage.service';
import { UniquePipe } from '../../utils/unique.pipe';
import moment from 'moment';

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
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
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

  setDateRange(checkIn: Date, checkOut: Date) {
    this.filters.checkInDate = checkIn;
    this.filters.checkInDate = checkIn;
    this.filters.checkOutDate = checkOut;
    console.log(`Check-in service: ${this.filters.checkInDate}, Check-out: ${this.filters.checkOutDate}`);
    this.applyFilters();
  }

  private applyFilters() {
    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe((data) => {
      let mergedData = data;
      mergedData = this.uniquePipe.transform(mergedData, 'roomId')
      
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
      if (this.filters.checkInDate !== null && this.filters.checkOutDate !== null) {
        const checkInDate = moment(this.filters.checkInDate);
        const checkOutDate = moment(this.filters.checkOutDate);
  
        mergedData = mergedData.filter(room => {
          const stayDateFrom = moment(room.stayDateFrom);
          const stayDateTo = moment(room.stayDateTo);
  
          return checkInDate.isBetween(stayDateFrom, stayDateTo, 'days', '[]') && checkOutDate.isBetween(stayDateFrom, stayDateTo, 'days', '[]');
        });
      }
    const reservations = this.localStorageService.getAllReservationsFromLocalStorage();

    if(this.filters.isCustomer){
      mergedData = mergedData.filter(room => {
        const roomReservations = reservations.filter((reservation: { roomId: number; }) => reservation.roomId === room.roomId);
      
        let isRoomAvailable = true;
        
        roomReservations.forEach((reservation: { checkOut: string; checkIn: string }) => {
          const checkInDate = moment(reservation.checkIn);
          const checkOutDate = moment(reservation.checkOut);
          const stayDuration = checkOutDate.diff(checkInDate, 'days');
          if (stayDuration < room.minStay || stayDuration > room.maxStay) {
            isRoomAvailable = false;
          }
        });
      
        return isRoomAvailable;
      });
    }
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
