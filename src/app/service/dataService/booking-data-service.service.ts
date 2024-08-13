import { Injectable } from '@angular/core';
import { BookingDetails } from '../../interface/booking-details';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingDataServiceService {

  private bookingDetails =  new Subject<BookingDetails>();

  constructor() { }

  bookingDetails$ = this.bookingDetails.asObservable();

  setReservationDetails(){
    
  }
}
