import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ReservationDetails } from '../../interface/reservation-details';
import { CustomerDetails } from '../../interface/customer-details';

@Component({
  selector: 'app-customer-dtails-form',
  templateUrl: './customer-dtails-form.component.html',
  styleUrl: './customer-dtails-form.component.scss',
})
export class CustomerDtailsFormComponent {
  public customerFormData!: FormGroup;
  public reservationDetails!: ReservationDetails;
  public customerDetails: CustomerDetails = {
    name: '',
    birthData: new Date(),
    pincode: 0,
    district: '',
    city: '',
    state: '',
    phoneNumber: 0,
    bookingId: [],
    paymentId: [],
  };

  constructor(private fb: FormBuilder, private router: Router) {
    // data from the previous component
    this.reservationDetails = history.state.reservationDetails;

    // initialize form
    this.customerFormData = this.fb.group({
      name: [''],
      birthDate: [''],
      pincode: [''],
      district: [''],
      city: [''],
      state: [''],
      phoneNumber: [''],
    });
  }
  onSubmit() {
    console.log('onSubmit', this.customerFormData.value);

    if (this.customerFormData) {
      this.customerDetails.name = this.customerFormData.get('name')?.value;
      this.customerDetails.birthData = new Date(this.customerFormData.get('birthDate')?.value);
      this.customerDetails.pincode = this.customerFormData.get('pincode')?.value;
      this.customerDetails.district = this.customerFormData.get('district')?.value;
      this.customerDetails.city = this.customerFormData.get('city')?.value;
      this.customerDetails.state = this.customerFormData.get('state')?.value;
      this.customerDetails.phoneNumber = this.customerFormData.get('phoneNumber')?.value;

      console.log('customerDetails', this.customerDetails);

      this.router.navigate(['/payment'],{state: {reservationDetails: this.reservationDetails, customerDetails: this.customerDetails}});

      
    }
  }
}
