import { Component } from '@angular/core';
import { LocalStorageService } from '../../../service/localStorageApi/local-storage.service';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { FilterService } from '../../../service/filterService/filter.service';
import { MatDialog } from '@angular/material/dialog';
import { ReservationDialogNewComponent } from '../reservation-dialog-new/reservation-dialog-new.component';
import { CustomerDetails } from '../../../interface/customer-details';
import { ReservationDetails } from '../../../interface/reservation-details';
import { PaymentDetails } from '../../../interface/payment-details';

declare var bootstrap: any; // To access Bootstrap's JavaScript methods

@Component({
  selector: 'app-table-for-owner-portal',
  templateUrl: './table-for-owner-portal.component.html',
  styleUrl: './table-for-owner-portal.component.scss'
})
export class TableForOwnerPortalComponent {
  customers: CustomerDetails[] = [];
  reservations: ReservationDetails[] = [];
  paymentDetails: PaymentDetails[] = [];
  combinedDetails: any[] = [];
  statuses: string[] = ['Confirmed', 'Check-In', 'Check-Out'];
  roomsData: RoomAndRoomStayDetails[] = [];
  selectedDetail: any = null;

  constructor(private localStorageService: LocalStorageService, private apiService: RoomDetailsApiService, private filterService: FilterService,public dialog: MatDialog) {
    this.apiService.fetchAllDataForCustomerPortal().subscribe(data => {
      this.roomsData = data;
      console.log("roomData",this.roomsData);
    })
  }

  ngOnInit() {
    this.reservations = this.localStorageService.getAllReservationsFromLocalStorage();
    this.customers = this.localStorageService.getAllCustomersFromLocalStorage();
    this.paymentDetails = this.localStorageService.getAllPaymentsFromLocalStorage();

    this.combinedDetails = this.reservations.map(reservation => {
      const customerForCombinedData = this.customers.find(res => res.customerId === reservation.customerId);
      const paymentForCombinedData = this.paymentDetails.find(pay => reservation.paymentIds.includes(pay.paymentId));
      
      return {
        customerId: customerForCombinedData?.customerId,
        name: `${customerForCombinedData?.firstName} ${customerForCombinedData?.middleName} ${customerForCombinedData?.lastName}`,
        birthData: customerForCombinedData?.birthData,
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
        // locationName: reservation?.locationName || '',
        // roomName: reservation?.roomName || '',
        dueAmount: paymentForCombinedData?.paymentDue || 0,
        amount: paymentForCombinedData?.paymentAmount || 0,
        status: reservation.status
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

  openModalForBookedDetais(detail: any) {
    this.selectedDetail = detail;
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
  }

  openDialog() {
    const dialogRef = this.dialog.open(ReservationDialogNewComponent, {data: { roomId: null },panelClass: 'my-outlined-dialog'});

    dialogRef.afterClosed().subscribe(result => {
      this.filterService.resetFilters();
      this.filterService.setSubmitted(false);
      console.log(`Dialog result: ${result}`);
    });
  }


}
