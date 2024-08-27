import { Component } from '@angular/core';
import { LocalStorageService } from '../../../service/localStorageApi/local-storage.service';

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

  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit() {
    // Load data from localStorage
    this.customers = this.localStorageService.getAllCustomersFromLocalStorage();
    this.reservations = this.localStorageService.getAllReservationsFromLocalStorage();
    this.paymentDetails = this.localStorageService.getAllPaymentsFromLocalStorage();
// Combine the data based on customerId
this.combinedDetails = this.customers.map(customer => {
  const reservation = this.reservations.find(res => res.customerId === customer.customerId) || {};
  const payment = this.paymentDetails.find(pay => pay.customerId === customer.customerId) || {};
  
  return {
    customerId: customer.customerId,
    firstName: customer.firstName,
    birthData: customer.birthData,
    reservationId: reservation.reservationId || '',
    locationId: reservation.locationId || '',
    roomId: reservation.roomId || '',
    paymentId: payment.paymentId || '',
    amount: payment.paymentAmount || '',
    status: customer.status || reservation.status || payment.status || this.statuses[0]
  };
});
}

updateStatus(detail: any) {
  // Update customer status
  

  // Update reservation status
  const reservationIndex = this.reservations.findIndex(res => res.customerId === detail.customerId);
  if (reservationIndex !== -1) {
    this.reservations[reservationIndex].status = detail.status;
  }

 

  // Save the updated data back to localStorage
  this.localStorageService.setReservations(this.reservations);
}
}
