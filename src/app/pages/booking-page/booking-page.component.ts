import { Component } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { ReservationDetails } from '../../interface/reservation-details';
import { PaymentDetails } from '../../interface/payment-details';
import { CustomerDetails } from '../../interface/customer-details';
import { RoomDetailsApiService } from '../../service/apiService/room-details-api.service';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent {
  public roomToBeBooked?: RoomAndRoomStayDetails[];
  public reservationDetails!: ReservationDetails;
  public customerDetails!: CustomerDetails;
  public paymentDetails!: PaymentDetails;

  public currentFormIndex: number = 0;

  constructor(private roomDetailsApiService: RoomDetailsApiService) {
    const roomId = history.state.roomId;
    if(roomId) {
      this.roomDetailsApiService.findRoomByRoomId(roomId).subscribe(room => {
        this.roomToBeBooked = room;
      })
    }
  }

  onReservationConfirmed(reservationDetails: ReservationDetails) {
    this.reservationDetails = reservationDetails;
    this.currentFormIndex = 1; // Show the next form
  }

  onCustomerDetailsSubmitted(customerDetails: CustomerDetails) {
    this.customerDetails = customerDetails;
    this.currentFormIndex = 2; // Show the payment form
  }

  onPaymentDetailsSubmitted(paymentDetails: PaymentDetails) {
    this.paymentDetails = paymentDetails;
    this.currentFormIndex = 3; // Show the success message
    // Handle payment submission and final steps
  }

  onBackToBookingForm() {
    this.currentFormIndex = 0;
  }

  backToCustomerForm() {
    this.currentFormIndex = 1;
  }

  printInvoice() {
    window.print();
  }
}
