import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReservationDetails } from '../../interface/reservation-details';
import { CustomerDetails } from '../../interface/customer-details';
import { PaymentDetails } from '../../interface/payment-details';
import { Router } from '@angular/router';
import ShortUniqueId from 'short-unique-id';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';

@Component({
  selector: 'app-payment-detail-form',
  templateUrl: './payment-detail-form.component.html',
  styleUrl: './payment-detail-form.component.scss'
})
export class PaymentDetailFormComponent {

  public paymentFormData!: FormGroup;
  public reservationDetails: ReservationDetails = {} as ReservationDetails;
  public customerDetails: CustomerDetails = {} as CustomerDetails;
  public paymentDetails: PaymentDetails = {
    paymentId: '',
    reservationId: '',
    customerId: '',
    paymentDate: new Date(),
    paymentAmount: 0,
    paymentMode: ''
  };

  public showModal: boolean = false;
  

  constructor(private fb: FormBuilder, private router: Router, private localStorageService: LocalStorageService) {
    // data from the previous component
    this.reservationDetails = history.state.reservationDetails;
    this.customerDetails = history.state.customerDetails;

    // initialize form
    this.paymentFormData = this.fb.group({
      paymentDate: [''],
      paymentAmount: [''],
      paymentMode:['']
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    if(this.paymentFormData.valid){
      const uid = new ShortUniqueId({ length: 10 });
      const generatedReservationId = uid.rnd();
      const generatedCustomerId = this.customerDetails.customerId? this.customerDetails.customerId : uid.rnd();
      const generatedPaymentId = uid.rnd();

      //payment details
      this.paymentDetails.paymentId = generatedPaymentId;
      this.paymentDetails.reservationId = generatedReservationId;
      this.paymentDetails.paymentDate = this.paymentFormData.get('paymentDate')?.value;
      this.paymentDetails.paymentAmount = this.paymentFormData.get('paymentAmount')?.value;
      this.paymentDetails.paymentMode = this.paymentFormData.get('paymentMode')?.value;
      this.paymentDetails.customerId = generatedCustomerId;

      // customer details
      this.customerDetails.customerId = generatedCustomerId;
      this.customerDetails.reservationId.push(generatedReservationId);
      
      // reservation details
      this.reservationDetails.reservationId = generatedReservationId;
      this.reservationDetails.paymentId.push(generatedPaymentId);
      this.reservationDetails.customerId = generatedCustomerId;
      

      this.localStorageService.setLocalStorage(this.customerDetails, this.reservationDetails, this.paymentDetails);
      
      console.log("reservationDetails",this.reservationDetails);
      console.log("customerDetails",this.customerDetails);
      console.log("paymentDetails",this.paymentDetails);


    }
  }
}
