import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { ReservationDetails } from '../../interface/reservation-details';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';
import { FilterService } from '../../service/filterService/filter.service';
import { RoomDetailsApiService } from '../../service/apiService/room-details-api.service';

@Component({
  selector: 'app-booking-details-form',
  templateUrl: './booking-details-form.component.html',
  styleUrls: ['./booking-details-form.component.scss'],
})
export class BookingDetailsFormComponent {
  minDate = new Date().toISOString().split('T')[0];
  public bookingDetails!: FormGroup;
  @Input() roomToBeBooked?: RoomAndRoomStayDetails;
  @Output() reservationConfirmed = new EventEmitter<ReservationDetails>();
  @Input() reservationDetailsFromParent?: ReservationDetails;
  roomDetails: RoomAndRoomStayDetails[] = [];

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



  constructor(private fb: FormBuilder, private route: ActivatedRoute, private localStorageService: LocalStorageService, private filterService: FilterService, private roomDetailsApiService: RoomDetailsApiService) {
    console.log("service details", this.filterService.filters.checkInDate)
    this.bookingDetails = this.fb.group({
      locationName: [''],
      roomName: [''],
      checkIn: [ this.filterService.filters.checkInDate, [Validators.required, this.checkInDateValidator.bind(this)]],
      checkOut: [ this.filterService.filters.checkInDate, [Validators.required, this.checkOutDateValidator.bind(this)]],
      numberOfGuests: [this.filterService.filters.guests, [Validators.required, Validators.min(1), this.guestValidator.bind(this)]],
      totalAmount: [''],
    });

    if(this.reservationDetailsFromParent?.numberOfGuests && this.reservationDetailsFromParent?.totalAmount) {
      this.bookingDetails.patchValue({
        numberOfGuests: this.reservationDetailsFromParent?.numberOfGuests? this.reservationDetailsFromParent?.numberOfGuests : '',
        totalAmount: this.reservationDetailsFromParent?.totalAmount? this.reservationDetailsFromParent?.totalAmount : '',
      })
    }

    if(this.filterService.filters.checkInDate || this.filterService.filters.checkOutDate || this.filterService.filters.guests) {
      this.bookingDetails.patchValue({
        checkIn: this.filterService.filters?.checkInDate ? moment(this.filterService.filters?.checkInDate).format('YYYY-MM-DD'): '',
        checkOut: this.filterService.filters?.checkOutDate ? moment(this.filterService.filters?.checkOutDate).format('YYYY-MM-DD'): '',
        numberOfGuests: this.filterService.filters?.guests ? this.filterService.filters?.guests : '',
      })
    }

    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {
      this.roomDetails = data;
    })
  }

  get getIsFromTable() {
    return this.filterService.isFromTable;
  }

  get getCheckInDate() {
    return this.filterService.filters?.checkInDate ? this.filterService.filters?.checkInDate : new Date();
  }


  get getCheckOutDate() {
    return this.filterService.filters?.checkOutDate ? this.filterService.filters?.checkOutDate : new Date();
  }

  loadRoom(stringRoomId: string) {
    const roomId = Number(stringRoomId);
    this.roomDetailsApiService.findRoomByRoomId(roomId).subscribe(data => {
      this.roomToBeBooked = data;
    });

  }

  calculateTotalPrice() {
    const checkInDate = moment(this.bookingDetails?.get('checkIn')?.value).hours(11) ?? moment();
    const checkOutDate = moment(this.bookingDetails?.get('checkOut')?.value).hours(10) ?? moment();
    const numberOfGuests = this.bookingDetails?.get('numberOfGuests')?.value ?? 0;
    const pricePerDayPerPerson = this.roomToBeBooked?.pricePerDayPerPerson;
  
    
  
    if (checkInDate && checkOutDate && numberOfGuests && pricePerDayPerPerson) {
  
      const numberOfDays = Math.ceil(checkOutDate.diff(checkInDate, 'hours')/24);

      this.reservationDetails.numberOfDays = numberOfDays > 0 ? numberOfDays : 0;
      const totalPrice = numberOfDays * numberOfGuests * pricePerDayPerPerson;
      this.reservationDetails.totalAmount = totalPrice > 0 ? totalPrice : 0;

      this.bookingDetails.patchValue({
        totalAmount: totalPrice > 0 ? totalPrice : 0,
      });
    } else {
      console.log("No matching room found for the selected dates.");
      this.bookingDetails.patchValue({
        totalAmount: 0,
      });
    }
  }
  
  checkInDateValidator(control: AbstractControl): ValidationErrors | null {
    this.filterService.filters.checkInDate = control.value;
    const dateValue = moment(control.value).hours(11);
    const checkInDateValue = this.roomToBeBooked?.stayDateFrom ? moment(this.roomToBeBooked?.stayDateFrom).hours(11) : moment();
    const checkOutDateValue = this.roomToBeBooked?.stayDateTo ? moment(this.roomToBeBooked?.stayDateTo).hours(10) : moment();
  
    if (!dateValue.isSameOrAfter(checkInDateValue) || !dateValue.isSameOrBefore(checkOutDateValue)) {
      return { invalidDate: 'Check-in date does not match any available booking period' };
    }

    const storedReservations = this.localStorageService.getReservationsById(this.roomToBeBooked?.roomId) ?? [];

    let overlappingReservation = false;

    storedReservations.forEach((reservation: ReservationDetails) => {
      const reservationCheckIn = moment(reservation.checkIn).hours(11);
      const reservationCheckOut = moment(reservation.checkOut).hours(10);
      if (dateValue.isBetween(reservationCheckIn, reservationCheckOut, null, '[)')) {
        overlappingReservation = true;
      }
    })
  
    if (overlappingReservation) {
      return { duplicateReservation: 'This check-in date overlaps with an existing reservation for this room.' };
    }
  
    const arrivalDays: string[] = this.roomToBeBooked?.arrivalDays.map(day => day.toUpperCase()) ?? [];
    const dateDay = dateValue.format('ddd').toUpperCase();
  
    if (arrivalDays.length > 0 && !arrivalDays.includes(dateDay)) {
      return { checkInDateValidation: `Check-in date must be on ${arrivalDays.join(', ')}` };
    }
  
    return null;
  }
  
  checkOutDateValidator(control: AbstractControl): ValidationErrors | null {
    this.filterService.filters.checkOutDate = control.value;
    const dateValue = moment(control.value).hours(10);
    const checkInDateFromUser = this.bookingDetails?.get('checkIn')?.value ? moment(this.bookingDetails?.get('checkIn')?.value).hours(11) : moment();
    const checkInDateValue = this.roomToBeBooked?.stayDateFrom ? moment(this.roomToBeBooked?.stayDateFrom).hours(11) : moment();
    const checkOutDateValue = this.roomToBeBooked?.stayDateTo ? moment(this.roomToBeBooked?.stayDateTo).hours(10) : moment();
    
  
    if (!dateValue.isSameOrAfter(checkInDateValue) || !dateValue.isSameOrBefore(checkOutDateValue)) {
      return { invalidDate: 'Check-out date does not match any available booking period' };
    }

    const storedReservations = this.localStorageService.getReservationsById(this.roomToBeBooked?.roomId) ?? [];

    let overlappingReservation = false;

    storedReservations.forEach((reservation: ReservationDetails) => {
      const reservationCheckIn = moment(reservation.checkIn).hours(11);
      const reservationCheckOut = moment(reservation.checkOut).hours(10);
      if (dateValue.isBetween(reservationCheckIn, reservationCheckOut, null, '[]')) {
        overlappingReservation = true;
      }
    })
  
    if (overlappingReservation) {
      return { duplicateReservation: 'This check-out date overlaps with an existing reservation for this room.' };
    }
  
    const departureDays: string[] = this.roomToBeBooked?.departureDays.map(day => day.toUpperCase()) ?? [];
    const dateDay = dateValue.format('ddd').toUpperCase();
  
    if (departureDays.length > 0 && !departureDays.includes(dateDay)) {
      return { checkOutDateValidation: `Check-out date must be on ${departureDays.join(', ')}` };
    }
  
    const numberOfDays = dateValue.diff(checkInDateFromUser, 'days') + 1;
  
    if (numberOfDays < this.roomToBeBooked!.minStay) {
      return { minStay: `Minimum stay is ${this.roomToBeBooked?.minStay} nights` };
    }
  
    if (numberOfDays > this.roomToBeBooked!.maxStay) {
      return { maxStay: `Maximum stay is ${this.roomToBeBooked!.maxStay} nights` };
    }
  
    return null;
  }
  
  

  guestValidator(control: AbstractControl): ValidationErrors | null {
    this.filterService.filters.guests = control.value;
    const guests = control.value;
    const checkInDateFromUser = new Date(this.bookingDetails?.get('checkIn')?.value);
    const checkOutDateFromUser = new Date(this.bookingDetails?.get('checkOut')?.value);
  
    if (!checkInDateFromUser || !checkOutDateFromUser) {
      return { invalidGuests: 'Check-in and check-out dates are required' };
    }
    const allowedGuests = this.roomToBeBooked?.guestCapacity;
  
    if (guests < 1) {
      return { invalidGuests: 'Number of guests must be greater than 0' };
    }
  
    if (allowedGuests && guests > allowedGuests) {
      return { invalidGuests: `Number of guests cannot exceed ${allowedGuests}` };
    }
  
    return null;
  }
  

  goBack(): void {
    this.filterService.resetFilters();
    window.history.back();
  }

  
  onSubmit() {
    if (this.bookingDetails.valid) {
      const checkInDate = moment(this.bookingDetails.get('checkIn')?.value).hours(11);
      const checkOutDate = moment(this.bookingDetails.get('checkOut')?.value).hours(10);
      
      this.reservationDetails = {
        ...this.reservationDetails,
        reservationId: '',
        locationId: this.roomToBeBooked!.locationId,
        roomId: this.roomToBeBooked!.roomId,
        customerId: '',
        checkIn: checkInDate.toDate(),
        checkOut: checkOutDate.toDate(), 
        reservationDate: moment().toDate(),
        totalAmount: this.bookingDetails.get('totalAmount')?.value,
        status: '',
        paidAmount: 0,
        numberOfGuests: this.bookingDetails.get('numberOfGuests')?.value,
        pricePerDayPerPerson: this.roomToBeBooked!.pricePerDayPerPerson,
        numberOfDays: Math.ceil(checkOutDate.diff(checkInDate, 'hours')/24),
        paymentIds: [],
      };

      this.reservationConfirmed.emit(this.reservationDetails);
    } else {
      console.error("No matching room found for the selected dates.");
    }
  }
  
  
}