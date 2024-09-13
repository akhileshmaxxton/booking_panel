import { Component, HostListener } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { ReservationDetails } from '../../interface/reservation-details';
import { PaymentDetails } from '../../interface/payment-details';
import { CustomerDetails } from '../../interface/customer-details';
import { RoomDetailsApiService } from '../../service/apiService/room-details-api.service';
import { FilterService } from '../../service/filterService/filter.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss'
})
export class BookingPageComponent {
  public roomToBeBooked?: RoomAndRoomStayDetails;
  public reservationDetails!: ReservationDetails;
  public customerDetails!: CustomerDetails;
  public paymentDetails!: PaymentDetails;

  public currentFormIndex: number = 0;

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.filterService.resetFilters();
  }

  constructor(private roomDetailsApiService: RoomDetailsApiService, private filterService: FilterService, private route: ActivatedRoute, private router: Router) {
    if(this.filterService.getIsCustomer()) {
      const roomId = history.state.roomId;
      this.roomDetailsApiService.findRoomByRoomId(roomId).subscribe(room => {
        this.roomToBeBooked = room;
      })
    }
    

    if(!this.filterService.getIsCustomer()){
      this.route.queryParams.subscribe(params => {
        if(params['roomId']) {
          this.roomDetailsApiService.findRoomByRoomId(parseInt(params['roomId'])).subscribe(data => {
            this.roomToBeBooked = data;
          })        
        }
      });
    }
  }

  onReservationConfirmed(reservationDetails: ReservationDetails) {
    this.reservationDetails = reservationDetails;
    console.log("Reservation Details outside: ", this.reservationDetails);
    this.currentFormIndex = 1;
  }

  onCustomerDetailsSubmitted(customerDetails: CustomerDetails) {
    this.customerDetails = customerDetails;
    this.currentFormIndex = 2;
  }

  onPaymentDetailsSubmitted(paymentDetails: PaymentDetails) {
    this.paymentDetails = paymentDetails;
    this.currentFormIndex = 3; 
    
  }

  onBackToBookingForm() {
    this.currentFormIndex = 0;
  }

  backToCustomerForm() {
    this.currentFormIndex = 1;
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
