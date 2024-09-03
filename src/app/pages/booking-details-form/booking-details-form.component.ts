import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { ReservationDetails } from '../../interface/reservation-details';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';
import { FilterService } from '../../service/filterService/filter.service';

@Component({
  selector: 'app-booking-details-form',
  templateUrl: './booking-details-form.component.html',
  styleUrls: ['./booking-details-form.component.scss'],
})
export class BookingDetailsFormComponent {
  minDate = new Date().toISOString().split('T')[0];
  public bookingDetails!: FormGroup;
  @Input() roomToBeBooked?: RoomAndRoomStayDetails[];
  @Output() reservationConfirmed = new EventEmitter<ReservationDetails>();
  @Input() reservationDetailsFromParent?: ReservationDetails;

  checkInDateFromOwner?: Date;
  checkOutDateFromOwner? : Date;

  reservationDetails: ReservationDetails = {
    reservationId: '',
    locationId: 0,
    roomId: 0,
    customerId: '',
    checkIn: new Date(),
    checkOut: new Date(),
    reservationDate: new Date(),
    totalAmount: 0,
    status: '',
    paidAmount: 0,
    numberOfGuests: 0,

    pricePerDayPerPerson: 0,
    numberOfDays: 0,
    paymentIds: [],
  };



  constructor(private fb: FormBuilder, private route: ActivatedRoute, private localStorageService: LocalStorageService, private filterService: FilterService) {
    console.log("service details", this.filterService.filters.checkInDate)
    this.bookingDetails = this.fb.group({
      locationName: [''],
      roomName: [''],
      checkIn: [ this.filterService.filters.checkInDate, [Validators.required, this.checkInDateValidator.bind(this)]],
      checkOut: [ this.filterService.filters.checkInDate, [Validators.required, this.checkOutDateValidator.bind(this)]],
      numberOfGuests: ['', [Validators.required, Validators.min(1), this.guestValidator.bind(this)]],
      totalAmount: [''],
    });

    if(this.reservationDetailsFromParent?.numberOfGuests && this.reservationDetailsFromParent?.totalAmount) {
      this.bookingDetails.patchValue({
        numberOfGuests: this.reservationDetailsFromParent?.numberOfGuests? this.reservationDetailsFromParent?.numberOfGuests : '',
        totalAmount: this.reservationDetailsFromParent?.totalAmount? this.reservationDetailsFromParent?.totalAmount : '',
      })
    }

    if(this.filterService.filters.checkInDate || this.filterService.filters.checkOutDate || this.filterService.filters.guests) {
      console.log("checkInDate to booking", this.filterService.filters.checkInDate)
      this.bookingDetails.patchValue({
        checkIn: this.filterService.filters?.checkInDate ? moment(this.filterService.filters?.checkInDate).format('YYYY-MM-DD'): '',
        checkOut: this.filterService.filters?.checkOutDate ? moment(this.filterService.filters?.checkOutDate).format('YYYY-MM-DD'): '',
        numberOfGuests: this.filterService.filters?.guests ? this.filterService.filters?.guests : '',
      })
    }
  }

  get getCheckInDate() {
    return this.filterService.filters?.checkInDate ? this.filterService.filters?.checkInDate : new Date();
  }


  get getCheckOutDate() {
    return this.filterService.filters?.checkOutDate ? this.filterService.filters?.checkOutDate : new Date();
  }

  calculateTotalPrice() {
    const checkInDate = moment(this.bookingDetails?.get('checkIn')?.value).hours(11) ?? moment();
    const checkOutDate = moment(this.bookingDetails?.get('checkOut')?.value).hours(10) ?? moment();
    const numberOfGuests = this.bookingDetails?.get('numberOfGuests')?.value ?? 0;
  
    const matchingRoom = this.roomToBeBooked?.find(room => {
      const stayFromDate = moment(room.stayDateFrom).hours(11);
      const stayToDate = moment(room.stayDateTo).hours(10);
      return checkInDate.isSameOrAfter(stayFromDate) && checkOutDate.isSameOrBefore(stayToDate);
    });
  
    if (matchingRoom) {
      const pricePerDayPerPerson = matchingRoom.pricePerDayPerPerson;
  
      if (checkInDate && checkOutDate && pricePerDayPerPerson && numberOfGuests) {
        const numberOfDays = Math.ceil(checkOutDate.diff(checkInDate, 'hours')/24);
        console.log("number of days", numberOfDays)
        console.log("time ",checkOutDate.diff(checkInDate, 'hours')/24)
  
        this.reservationDetails.numberOfDays = numberOfDays > 0 ? numberOfDays : 0;
  
        const totalPrice = numberOfDays * numberOfGuests * pricePerDayPerPerson;
  
        this.bookingDetails.patchValue({
          totalAmount: totalPrice > 0 ? totalPrice : 0,
        });
      }
    } else {
      console.log("No matching room found for the selected dates.");
      this.bookingDetails.patchValue({
        totalAmount: 0,
      });
    }
  }
  
  checkInDateValidator(control: AbstractControl): ValidationErrors | null {
    const dateValue = moment(control.value).hours(11);
    const matchingRoom = this.roomToBeBooked?.find(room => {
      const stayFromDate = moment(room.stayDateFrom).hours(11);
      const stayToDate = moment(room.stayDateTo).hours(10);
      return dateValue.isBetween(stayFromDate, stayToDate, null, '[]');
    });
  
    if (!matchingRoom) {
      return { invalidDate: 'Check-in date does not match any available booking period' };
    }
  
    const arrivalDays: string[] = matchingRoom.arrivalDays.map(day => day.toUpperCase()) ?? [];
    const dateDay = dateValue.format('ddd').toUpperCase();
  
    if (!arrivalDays.includes(dateDay)) {
      return { checkInDateValidation: `Check-in date must be on ${arrivalDays.join(', ')}` };
    }
  
    const storedReservations = this.localStorageService.getReservationsById(matchingRoom.roomId) ?? [];
    let overlappingReservation = false;
  
    if (overlappingReservation) {
      return { duplicateReservation: 'This check-in date overlaps with an existing reservation for this room.' };
    }

    storedReservations.forEach((reservation: ReservationDetails) => {
      console.log("storedReservations",reservation.checkIn,reservation.checkOut)
      const reservationCheckIn = moment(reservation.checkIn).hours(11);
      const reservationCheckOut = moment(reservation.checkOut).hours(10);
      if (dateValue.isBetween(reservationCheckIn, reservationCheckOut, null, '[]')) {
        overlappingReservation = true;
        console.log("trueeeee")
      }
    })
  
    return null;
  }
  
  checkOutDateValidator(control: AbstractControl): ValidationErrors | null {
    const dateValue = moment(control.value).hours(10);
    const checkInDate = moment(this.bookingDetails?.get('checkIn')?.value).hours(11);
  
    const matchingRoom = this.roomToBeBooked?.find(room => {
      const stayFromDate = moment(room.stayDateFrom).hours(11);
      const stayToDate = moment(room.stayDateTo).hours(10);
      return checkInDate.isBetween(stayFromDate, stayToDate, null, '[]') && dateValue.isBetween(stayFromDate, stayToDate, null, '[]');
    });
  
    if (!matchingRoom) {
      return { invalidDate: 'Check-out date does not match any available booking period' };
    }
  
    const departureDays: string[] = matchingRoom.departureDays.map(day => day.toUpperCase()) ?? [];
    const dateDay = dateValue.format('ddd').toUpperCase();
  
    if (!departureDays.includes(dateDay)) {
      return { checkOutDateValidation: `Check-out date must be on ${departureDays.join(', ')}` };
    }
  
    const numberOfDays = dateValue.diff(checkInDate, 'days') + 1;
  
    if (numberOfDays < matchingRoom.minStay) {
      return { minStay: `Minimum stay is ${matchingRoom.minStay} nights` };
    }
  
    if (numberOfDays > matchingRoom.maxStay) {
      return { maxStay: `Maximum stay is ${matchingRoom.maxStay} nights` };
    }
  
    const storedReservations = this.localStorageService.getReservationsById(matchingRoom.roomId) ?? [];
    let overlappingReservation = false;
    
    storedReservations.forEach((reservation: ReservationDetails) => {
      console.log("storedReservations",reservation.checkIn,reservation.checkOut)
      const reservationCheckIn = moment(reservation.checkIn).hours(11);
      const reservationCheckOut = moment(reservation.checkOut).hours(10);
      if (dateValue.isBetween(reservationCheckIn, reservationCheckOut, null, '[]')) {
        overlappingReservation = true;
        console.log("trueeeee")
      }
    })
  
    if (overlappingReservation) {
      return { duplicateReservation: 'This check-out date overlaps with an existing reservation for this room.' };
    }
  
    return null;
  }
  
  

  guestValidator(control: AbstractControl): ValidationErrors | null {
    const guests = control.value;
    const checkInDate = new Date(this.bookingDetails?.get('checkIn')?.value);
    const checkOutDate = new Date(this.bookingDetails?.get('checkOut')?.value);
  
    const matchingRoom = this.roomToBeBooked?.find(room => {
      const stayFromDate = new Date(room.stayDateFrom);
      const stayToDate = new Date(room.stayDateTo);
      return checkInDate >= stayFromDate && checkOutDate <= stayToDate;
    });
  
    if (!matchingRoom) {
      return { invalidGuests: 'No matching room found for the selected dates' };
    }
  
    const allowedGuests = matchingRoom.guestCapacity;
  
    if (guests < 1) {
      return { invalidGuests: 'Number of guests must be greater than 0' };
    }
  
    if (allowedGuests && guests > allowedGuests) {
      return { invalidGuests: `Number of guests cannot exceed ${allowedGuests}` };
    }
  
    return null;
  }
  

  goBack(): void {
    window.history.back();
  }

  
  onSubmit() {
    if (this.bookingDetails.valid) {
      const checkInDate = moment(this.bookingDetails.get('checkIn')?.value).hours(11);
      const checkOutDate = moment(this.bookingDetails.get('checkOut')?.value).hours(10);
      console.log("checkIn data type",checkInDate.toDate())
  
      const matchingRoom = this.roomToBeBooked?.find(room => {
        const stayFromDate = moment(room.stayDateFrom).hours(11);
        const stayToDate = moment(room.stayDateTo).hours(11);
        return checkInDate.isSameOrAfter(stayFromDate) && checkOutDate.isSameOrBefore(stayToDate);
      });
  
      if (matchingRoom) {
        this.reservationDetails = {
          ...this.reservationDetails,
          reservationId: '',
          locationId: matchingRoom.locationId,
          roomId: matchingRoom.roomId,
          checkIn: checkInDate.toDate(),
          checkOut: checkOutDate.toDate(), 
          reservationDate: moment().toDate(),
          totalAmount: this.bookingDetails.get('totalAmount')?.value,
          status: 'Confirmed',
          paidAmount: 0,
          numberOfGuests: this.bookingDetails.get('numberOfGuests')?.value,
          pricePerDayPerPerson: matchingRoom.pricePerDayPerPerson,
          numberOfDays: checkOutDate.diff(checkInDate, 'days'),
          paymentIds: [],
        };
  
        this.reservationConfirmed.emit(this.reservationDetails);
      } else {
        console.error("No matching room found for the selected dates.");
      }
    }
  }
  
}