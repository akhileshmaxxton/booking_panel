import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { ReservationDetails } from '../../interface/reservation-details';

@Component({
  selector: 'app-booking-details-form',
  templateUrl: './booking-details-form.component.html',
  styleUrl: './booking-details-form.component.scss'
})
export class BookingDetailsFormComponent{
  public bookingDetails!: FormGroup;
  public roomToBeBooked!: RoomAndRoomStayDetails;
  public reservationDetails: ReservationDetails = {
    reservationId: 0,
    roomId: 0,
    locationId: 0,
    checkIn: new Date(),
    checkOut: new Date(),
    numberOfGuests: 0,
    pricePerDayPerPerson: 0,
    numberOfDays: 0,
    totalAmount: 0
  };


  constructor(private fb: FormBuilder, private router: Router) {

    console.log("history",history.state);
    console.log("initialization", this.reservationDetails);
    // data from the previous component
    this.roomToBeBooked = history.state.room;
    console.log("roomData",this.roomToBeBooked);

    // initialize form
    this.bookingDetails = this.fb.group({
      locationName: [''],
      roomName: [''],
      pricePerDayPerPerson: [''],
      checkIn: [''],
      checkOut: [''],
      numberOfGuests: [''],
      totalAmount: ['']
    });

    // set default values from the data from the previous component
    if(this.roomToBeBooked){
      this.bookingDetails.patchValue({
        locationName: this.roomToBeBooked.locationName,
        roomName: this.roomToBeBooked.roomName,
        pricePerDayPerPerson: this.roomToBeBooked.pricePerDayPerPerson
      })
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

      if(totalPrice &&totalPrice>0){
        this.reservationDetails.totalAmount = totalPrice;
        this.bookingDetails.patchValue({
          totalAmount: totalPrice
        })
      }
      else{
        this.bookingDetails.patchValue({
          totalAmount: 0
        })
      }
      
    }
  }



  onSubmit() {
    console.log(this.bookingDetails.value);

    if(this.bookingDetails){
      this.reservationDetails.roomId = this.roomToBeBooked.roomId;
      this.reservationDetails.locationId = this.roomToBeBooked.locationId;
      this.reservationDetails.checkIn = new Date(this.bookingDetails.get('checkIn')?.value);
      this.reservationDetails.checkOut = new Date(this.bookingDetails.get('checkOut')?.value);
      this.reservationDetails.numberOfGuests = this.bookingDetails.get('numberOfGuests')?.value;
      this.reservationDetails.pricePerDayPerPerson = this.roomToBeBooked.pricePerDayPerPerson;

      this.router.navigate(['/customer-details'], { state: { reservationDetails: this.reservationDetails } });
    }
  }
}
