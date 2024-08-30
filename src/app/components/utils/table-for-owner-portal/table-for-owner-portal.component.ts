import { Component } from '@angular/core';
import { LocalStorageService } from '../../../service/localStorageApi/local-storage.service';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';

@Component({
  selector: 'app-table-for-owner-portal',
  templateUrl: './table-for-owner-portal.component.html',
  styleUrl: './table-for-owner-portal.component.scss'
})
export class TableForOwnerPortalComponent {
  customers: any[] = [];
  reservations: any[] = [];
  paymentDetails: any[] = [];
  combinedDetails: any[] = [];
  statuses: string[] = ['Confirmed', 'Check-In', 'Check-Out'];
  roomsData: RoomAndRoomStayDetails[] = [];

  constructor(private localStorageService: LocalStorageService, private apiService: RoomDetailsApiService) {
    this.apiService.fetchAllDataForCustomerPortal().subscribe(data => {
      this.roomsData = data;
      console.log("roomData",this.roomsData);
    })
   }

  ngOnInit() {
    this.customers = this.localStorageService.getAllCustomersFromLocalStorage();
    this.reservations = this.localStorageService.getAllReservationsFromLocalStorage();
    this.paymentDetails = this.localStorageService.getAllPaymentsFromLocalStorage();

    this.combinedDetails = this.customers.map(customer => {
    const reservation = this.reservations.find(res => res.customerId === customer.customerId) || {};
    const payment = this.paymentDetails.find(pay => pay.customerId === customer.customerId) || {};
    const roomData = this.roomsData.find(room => room.roomId === reservation.roomId) || {};
  
    return {
      customerId: customer.customerId,
      name: `${customer.firstName} ${customer.middleName} ${customer.lastName}`,
      birthData: customer.birthData,
      reservationId: reservation.reservationId || '',
      locationId: reservation.locationId || '',
      roomId: reservation.roomId || '',
      checkIn: reservation.checkIn || '',
      checkOut: reservation.checkOut || '',
      reservationDate: reservation.reservationDate || '',
      totalAmount: reservation.totalAmount || '',
      
      numberOfGuests: reservation.numberOfGuests || '',
      pricePerDayPerPerson: reservation.pricePerDayPerPerson || '',
      numberOfDays: reservation.numberOfDays || '',
      paymentIds: reservation.paymentIds || [],
      locationName: reservation.locationName || '',
      roomName: reservation.roomName || '',
      dueAmount: payment.paymentDue || 0,
      amount: payment.paymentAmount || '',
      status: customer.status || reservation.status || payment.status || this.statuses[0]
    };
});
console.log("combinedDetails",this.combinedDetails);
}

updateStatus(detail: any) {
  
  const reservationIndex = this.reservations.findIndex(res => res.customerId === detail.customerId);
  if (reservationIndex !== -1) {
    this.reservations[reservationIndex].status = detail.status;
  }

  this.localStorageService.setReservations(this.reservations);
}
}
