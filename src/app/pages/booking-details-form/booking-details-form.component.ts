import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { ReservationDetails } from '../../interface/reservation-details';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-details-form',
  templateUrl: './booking-details-form.component.html',
  styleUrls: ['./booking-details-form.component.scss'],
})
export class BookingDetailsFormComponent {
  public bookingDetails!: FormGroup;
  @Input() roomToBeBooked!: RoomAndRoomStayDetails;
  @Output() reservationConfirmed = new EventEmitter<ReservationDetails>();
  @Input() reservationDetailsFromParent!: ReservationDetails;
  @Output() backToBookingForm = new EventEmitter<void>();
  reservationDetails: ReservationDetails = {
    
    roomId: 0,
    locationId: 0,
    checkIn: new Date(),
    checkOut: new Date(),
    numberOfGuests: 0,
    numberOfDays: 0,
    pricePerDayPerPerson: 0,
    paymentId: [],
    reservationId: '',
    totalAmount: 0,
    customerId: ''
    
  };

  startDate: string | null = null;
  endDate: string | null = null;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    this.bookingDetails = this.fb.group({
      locationName: [''],
      roomName: [''],
      pricePerDayPerPerson: [''],
      checkIn: ['', [Validators.required, this.checkInDateValidator.bind(this)]],
      checkOut: ['', [Validators.required, this.checkOutDateValidator.bind(this)]],
      numberOfGuests: ['', [Validators.required, Validators.min(1), this.guestValidator.bind(this)]],
      totalAmount: [''],
    });

    if(this.reservationDetailsFromParent?.checkIn && this.reservationDetailsFromParent?.checkOut && this.reservationDetailsFromParent?.numberOfGuests && this.reservationDetailsFromParent?.totalAmount) {
      this.bookingDetails.patchValue({
        checkIn: new Date(this.reservationDetailsFromParent?.checkIn),
        checkOut: new Date(this.reservationDetailsFromParent?.checkOut),
        numberOfGuests: this.reservationDetailsFromParent?.numberOfGuests,
        totalAmount: this.reservationDetailsFromParent?.totalAmount
      })
    }


    console.log('Initial reservationDetails: constructor  ', this.reservationDetails);
  }

  ngOnInit() {
    console.log('Initial reservationDetails:', this.reservationDetails);
    if (this.roomToBeBooked) {
      console.log("Room to be booked:", this.roomToBeBooked);
      this.bookingDetails.patchValue({
        locationName: this.roomToBeBooked?.locationName,
        roomName: this.roomToBeBooked?.roomName,
        pricePerDayPerPerson: this.roomToBeBooked?.pricePerDayPerPerson,
      });

      this.bookingDetails.get('checkIn')?.updateValueAndValidity();
      this.bookingDetails.get('checkOut')?.updateValueAndValidity();
      this.bookingDetails.get('numberOfGuests')?.updateValueAndValidity();
    }

    this.route.queryParams.subscribe(params => {
      if(params['startDate'] && params['endDate'] && params['room']) {
        this.startDate = params['startDate'] || null;
        this.endDate = params['endDate'] || null;
        this.roomToBeBooked = params['room'] || null;

        this.bookingDetails.patchValue({
          checkIn: this.startDate ? new Date(this.startDate).toISOString().split('T')[0] : '',
          checkOut: this.endDate ? new Date(this.endDate).toISOString().split('T')[0] : '',
        })
      }

     
      console.log('Start Date:', this.startDate);
      console.log('End Date:', this.endDate);
      console.log('Room ID:', this.roomToBeBooked);
    });

    
  

    

    

  }

  calculateTotalPrice() {
    const checkInDate = new Date(this.bookingDetails?.get('checkIn')?.value) ?? new Date();
    const checkOutDate = new Date(this.bookingDetails?.get('checkOut')?.value ?? new Date());
    const numberOfGuests = this.bookingDetails?.get('numberOfGuests')?.value ?? 0;
    const pricePerDayPerPerson = this.roomToBeBooked?.pricePerDayPerPerson;
    console.log("checkInDate", checkInDate, "checkOutDate", checkOutDate, "numberOfGuests", numberOfGuests, "pricePerDayPerPerson", pricePerDayPerPerson);

    if (checkInDate && checkOutDate && pricePerDayPerPerson && numberOfGuests) {
      const timeDifference = Number(checkOutDate?.getTime() - checkInDate?.getTime()) ?? 0;
      console.log("Time difference",typeof timeDifference);
      const numberOfDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

      console.log("Number of days", numberOfDays);

      this.reservationDetails.numberOfDays = numberOfDays ? numberOfDays : 0;

      const totalPrice = numberOfDays * numberOfGuests * pricePerDayPerPerson;

      console.log("Total price", totalPrice);

      this.bookingDetails.patchValue({
        totalAmount: totalPrice > 0 ? totalPrice : 0,
      });
    }
  }

  checkInDateValidator(control: AbstractControl): ValidationErrors | null {
    const dateValue = moment(control.value);
    const stayFromDate = moment(this.roomToBeBooked?.stayDateFrom);
    const stayToDate = moment(this.roomToBeBooked?.stayDateTo);
    const arrivalDays: string[] = this.roomToBeBooked?.arrivalDays.map(day => day.toLowerCase()) ?? [];
    const dateDay = dateValue.format('ddd').toLowerCase();

    if (!dateValue.isValid()) {
      return { invalidDate: 'Invalid date' };
    }

    if (dateValue.isBefore(stayFromDate) || dateValue.isAfter(stayToDate)) {
      return { checkInDateValidation: `Check-in date must be between ${stayFromDate.format('YYYY-MM-DD')} and ${stayToDate.format('YYYY-MM-DD')}` };
    }

    if (!arrivalDays.includes(dateDay)) {
      return { checkInDateValidation: `Check-in date must be on ${arrivalDays.join(', ')}` };
    }

    return null;
  }

  checkOutDateValidator(control: AbstractControl): ValidationErrors | null {
    const dateValue = moment(control.value);
    const checkInDate = moment(this.bookingDetails?.get('checkIn')?.value);
    const stayToDate = moment(this.roomToBeBooked?.stayDateTo);
    const departureDays: string[] = this.roomToBeBooked?.departureDays.map(day => day.toLowerCase()) ?? [];
    const dateDay = dateValue.format('ddd').toLowerCase();

    if (!dateValue.isValid()) {
      return { invalidDate: 'Invalid date' };
    }

    if (dateValue.isBefore(checkInDate)) {
      return { invalidDate: 'Check-out date must be after check-in date' };
    }

    if (dateValue.isAfter(stayToDate)) {
      return { futureDate: `Check-out date cannot be after ${stayToDate.format('YYYY-MM-DD')}` };
    }

    if (!departureDays.includes(dateDay)) {
      return { checkOutDateValidation: `Check-out date must be on ${departureDays.join(', ')}` };
    }

    const numberOfDays = dateValue.diff(checkInDate, 'days') + 1;

    if (numberOfDays < this.roomToBeBooked.minStay) {
      return { minStay: `Minimum stay is ${this.roomToBeBooked.minStay} nights` };
    }

    if (numberOfDays > this.roomToBeBooked.maxStay) {
      return { maxStay: `Maximum stay is ${this.roomToBeBooked.maxStay} nights` };
    }

    return null;
  }

  guestValidator(control: AbstractControl): ValidationErrors | null {
    const guests = control.value;
    const allowedGuests = this.roomToBeBooked?.guestCapacity;

    if (guests < 1) {
      return { invalidGuests: 'Number of guests must be greater than 0' };
    }

    if (allowedGuests && guests > allowedGuests) {
      return { invalidGuests: `Number of guests cannot exceed ${allowedGuests}` };
    }

    return null;
  }

  goBack() {
    this.backToBookingForm.emit();
  }

  
  onSubmit() {
    if (this.bookingDetails.valid) {
      this.reservationDetails = {
        ...this.reservationDetails,
        roomId: this.roomToBeBooked.roomId,
        locationId: this.roomToBeBooked.locationId,
        checkIn: new Date(this.bookingDetails.get('checkIn')?.value),
        checkOut: new Date(this.bookingDetails.get('checkOut')?.value),
        numberOfGuests: this.bookingDetails.get('numberOfGuests')?.value,
        pricePerDayPerPerson: this.roomToBeBooked.pricePerDayPerPerson,
        paymentId: [],
      };

      this.reservationConfirmed.emit(this.reservationDetails);
    }
  }
}