import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { ReservationDetails } from '../../interface/reservation-details';

@Component({
  selector: 'app-booking-details-form',
  templateUrl: './booking-details-form.component.html',
  styleUrl: './booking-details-form.component.scss',
})
export class BookingDetailsFormComponent {
  public bookingDetails!: FormGroup;
  public roomToBeBooked: RoomAndRoomStayDetails = {} as RoomAndRoomStayDetails;
  public reservationDetails: ReservationDetails = {} as ReservationDetails;

  constructor(private fb: FormBuilder, private router: Router) {
    // data from the previous component
    this.roomToBeBooked = history.state.room;

    // initialize form
    this.bookingDetails = this.fb.group({
      locationName: [''],
      roomName: [''],
      pricePerDayPerPerson: [''],
      checkIn: [
        '',
        [Validators.required, this.checkInDateValidator.bind(this)],
      ],
      checkOut: [
        '',
        [Validators.required, this.checkOutDateValidator.bind(this)],
      ],
      numberOfGuests: [
        '',
        [
          Validators.required,
          Validators.min(1),
          this.guestValidator.bind(this),
        ],
      ],
      totalAmount: [''],
    });

    // set default values from the data from the previous component
    if (this.roomToBeBooked) {
      this.bookingDetails.patchValue({
        locationName: this.roomToBeBooked.locationName,
        roomName: this.roomToBeBooked.roomName,
        pricePerDayPerPerson: this.roomToBeBooked.pricePerDayPerPerson,
      });

      // Re-validate dependent fields
      this.bookingDetails.get('checkIn')?.updateValueAndValidity();
      this.bookingDetails.get('checkOut')?.updateValueAndValidity();
      this.bookingDetails.get('numberOfGuests')?.updateValueAndValidity();
    }
  }

  calculateTotalPrice() {
    const checkInDate = new Date(this.bookingDetails.get('checkIn')?.value);
    const checkOutDate = new Date(this.bookingDetails.get('checkOut')?.value);
    const numberOfGuests = this.bookingDetails.get('numberOfGuests')?.value;
    const pricePerDayPerPerson = this.roomToBeBooked?.pricePerDayPerPerson;

    if (checkInDate && checkOutDate && pricePerDayPerPerson && numberOfGuests) {
      const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
      const numberOfDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

      this.reservationDetails.numberOfDays = numberOfDays;

      const totalPrice = numberOfDays * numberOfGuests * pricePerDayPerPerson;

      if (totalPrice && totalPrice > 0) {
        this.reservationDetails.totalAmount = totalPrice;
        this.bookingDetails.patchValue({
          totalAmount: totalPrice,
        });
      } else {
        this.bookingDetails.patchValue({
          totalAmount: 0,
        });
      }
    }
  }

  checkInDateValidator(control: AbstractControl): ValidationErrors | null {
    const dateValue = new Date(control.value);
    const stayFromDate = new Date(this.roomToBeBooked?.stayDateFrom);

    if (isNaN(dateValue.getTime())) {
      return { invalidDate: 'Invalid date' };
    }

    if (stayFromDate && dateValue.getTime() < stayFromDate.getTime()) {
      return { pastDate: `Check-in date cannot be less than ${stayFromDate}` };
    }

    return null;
  }

  checkOutDateValidator(control: AbstractControl): ValidationErrors | null {
    const dateValue = new Date(control.value);
    const stayToDate = new Date(this.roomToBeBooked?.stayDateTo);

    if (isNaN(dateValue.getTime())) {
      return { invalidDate: 'Invalid date' };
    }

    if (stayToDate && dateValue.getTime() > stayToDate.getTime()) {
      return { futureDate: `Check-in date cannot be above ${stayToDate}` };
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
      return {
        invalidGuests: `Number of guests cannot exceed ${allowedGuests}`,
      };
    }

    return null;
  }

  onSubmit() {
    if (this.bookingDetails) {
      this.reservationDetails.roomId = this.roomToBeBooked.roomId;
      this.reservationDetails.locationId = this.roomToBeBooked.locationId;
      this.reservationDetails.checkIn = new Date(
        this.bookingDetails.get('checkIn')?.value
      );
      this.reservationDetails.checkOut = new Date(
        this.bookingDetails.get('checkOut')?.value
      );
      this.reservationDetails.numberOfGuests =
        this.bookingDetails.get('numberOfGuests')?.value;
      this.reservationDetails.pricePerDayPerPerson =
        this.roomToBeBooked.pricePerDayPerPerson;
        this.reservationDetails.paymentId = [];

      this.router.navigate(['/customer-details'], {
        state: { reservationDetails: this.reservationDetails },
      });
    }
  }
}
