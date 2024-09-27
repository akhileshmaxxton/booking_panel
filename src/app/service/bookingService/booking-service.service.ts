import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingServiceService {

  private arrivalDateSubject = new BehaviorSubject<Date | null>(null);
  private departureDateSubject = new BehaviorSubject<Date | null>(null);
  private guestCountSubject = new BehaviorSubject<number | null>(null);

  arrivalDate$ = this.arrivalDateSubject.asObservable();
  departureDate$ = this.departureDateSubject.asObservable();
  guestCount$ = this.guestCountSubject.asObservable();

  setArrivalDate(date: Date | null) {
    this.arrivalDateSubject.next(date);
  }

  setDepartureDate(date: Date | null) {
    this.departureDateSubject.next(date);
  }

  setGuestCount(count: number | null) {
    this.guestCountSubject.next(count);
  }
}
