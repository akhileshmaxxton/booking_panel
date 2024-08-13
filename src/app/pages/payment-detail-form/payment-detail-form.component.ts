import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReservationDetails } from '../../interface/reservation-details';
import { CustomerDetails } from '../../interface/customer-details';
import { PaymentDetails } from '../../interface/payment-details';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-detail-form',
  templateUrl: './payment-detail-form.component.html',
  styleUrl: './payment-detail-form.component.scss'
})
export class PaymentDetailFormComponent {

  public paymentFormData!: FormGroup;
  public reservationDetails!: ReservationDetails;
  public customerDetails!: CustomerDetails;
  public paymentDetails: PaymentDetails = {
    paymentId: 0,
    reservationId: 0,
    paymentDate: new Date(),
    paymentAmount: 0
  };
  

  constructor(private fb: FormBuilder, private router: Router) { 

    // data from the previous component
    this.reservationDetails = history.state.reservationDetails;
    this.customerDetails = history.state.customerDetails;

    // initialize form
    this.paymentFormData = this.fb.group({
      paymentDate: [''],
      paymentAmount: ['']
    });
  }
}
