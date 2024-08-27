import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationDetails } from '../../interface/reservation-details';
import { CustomerDetails } from '../../interface/customer-details';
import { PaymentDetails } from '../../interface/payment-details';
import { Router } from '@angular/router';
import ShortUniqueId from 'short-unique-id';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';

@Component({
  selector: 'app-payment-detail-form',
  templateUrl: './payment-detail-form.component.html',
  styleUrls: ['./payment-detail-form.component.scss']
})
export class PaymentDetailFormComponent implements OnInit {

  @Input() reservationDetails!: ReservationDetails;
  @Input() customerDetails!: CustomerDetails;
  
  @Output() paymentDetailsSubmitted = new EventEmitter<PaymentDetails>();
  @Output() backToCustomerForm = new EventEmitter<void>();

  public paymentFormData!: FormGroup;
  public paymentDetails: PaymentDetails = {
    paymentId: '',
    reservationId: '',
    customerId: '',
    paymentDate: new Date(),
    paymentAmount: 0,
    paymentMode: '',
    paymentDue: 0,
  };

  public showModal: boolean = false;
  
  constructor(private fb: FormBuilder, private router: Router, private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    // Initialize form with validation
    this.paymentFormData = this.fb.group({
      paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
      paymentAmount: ['', [Validators.required, Validators.min(this.reservationDetails?.totalAmount*0.1)]],
      paymentMode: ['', Validators.required]
    });

    // Set initial values for display
    this.paymentFormData.patchValue({
      paymentDate: new Date().toISOString().split('T')[0],
      paymentAmount: this.reservationDetails?.totalAmount,
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  goBack(){
    this.backToCustomerForm.emit();

  }

  onSubmit() {
    if(this.paymentFormData.valid) {
      const uid = new ShortUniqueId({ length: 10 });
      const generatedReservationId = uid.rnd();
      const generatedCustomerId = this.customerDetails?.customerId ? this.customerDetails?.customerId : uid.rnd();
      const generatedPaymentId = uid.rnd();

      // Payment details
      this.paymentDetails = {
        ...this.paymentDetails,
        paymentId: generatedPaymentId,
        reservationId: generatedReservationId,
        customerId: generatedCustomerId,
        paymentDate: new Date(this.paymentFormData.get('paymentDate')?.value),
        paymentAmount: this.paymentFormData.get('paymentAmount')?.value,
        paymentMode: this.paymentFormData.get('paymentMode')?.value,
        paymentDue: this.reservationDetails?.totalAmount - this.paymentFormData.get('paymentAmount')?.value
      };

      // Update customer and reservation details
    this.customerDetails = {
      ...this.customerDetails,
      customerId: generatedCustomerId,
      reservationIds: [...(this.customerDetails.reservationIds || []), generatedReservationId]
    };

    this.reservationDetails = {
      ...this.reservationDetails,
      reservationId: generatedReservationId,
      customerId: generatedCustomerId,
      paymentIds: [...(this.reservationDetails.paymentIds || []), generatedPaymentId]
    };

      // Optionally save data to local storage or any other service
      this.localStorageService.setLocalStorage(this.customerDetails, this.reservationDetails, this.paymentDetails);

      console.log("reservationDetails", this.reservationDetails);
      console.log("customerDetails", this.customerDetails);
      console.log("paymentDetails", this.paymentDetails);
      // Emit the payment details to the parent component
      this.paymentDetailsSubmitted.emit(this.paymentDetails);

    }
  }
}
