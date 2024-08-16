import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ReservationDetails } from '../../interface/reservation-details';
import { CustomerDetails } from '../../interface/customer-details';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';
import moment from 'moment';

@Component({
  selector: 'app-customer-dtails-form',
  templateUrl: './customer-dtails-form.component.html',
  styleUrl: './customer-dtails-form.component.scss',
})
export class CustomerDtailsFormComponent {
  public customerFormData!: FormGroup;
  public reservationDetails!: ReservationDetails;
  public customerDetails: CustomerDetails = {
    customerId: '',
    name: '',
    birthData: new Date(),
    pincode: 0,
    district: '',
    city: '',
    state: '',
    phoneNumber: 0,
    reservationId: [],
  };

  constructor(private fb: FormBuilder, private router: Router, private localStorageService: LocalStorageService) {
    // data from the previous component
    this.reservationDetails = history.state.reservationDetails;

    // initialize form
    this.customerFormData = this.fb.group({
      name: ['',[Validators.required, this.nameValidator]],
      birthDate: ['',[Validators.required, this.birthDateValidator]],
      pincode: ['',[Validators.required, this.pincodeValidator]],
      district: ['',[Validators.required, this.districtValidator]],
      city: ['',[Validators.required, this.cityValidator]],
      state: ['',[Validators.required, this.stateValidator]],
      phoneNumber: ['',[Validators.required, this.phoneNumberValidator]],
    });

    this.customerDetails.customerId = this.localStorageService.getCustomerFromSession();
    

    if(this.customerDetails?.customerId){

      this.customerDetails = this.localStorageService.getCustomerFromLocalStorage(this.customerDetails.customerId);
  
      this.customerFormData.patchValue({
        name: this.customerDetails?.name,
        birthDate:this.customerDetails?.birthData? moment(this.customerDetails.birthData).format('YYYY-MM-DD'): null,
        pincode: this.customerDetails?.pincode,
        district: this.customerDetails?.district,
        city: this.customerDetails?.city,
        state: this.customerDetails?.state,
        phoneNumber: this.customerDetails?.phoneNumber
      })
    }
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if(!value){
      return {invalidName: 'Name is required'}
    }
    return null;
  }
  birthDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if(!value){
      return {invalidBirthDate: 'Birth Date is required'}
    }
    return null;
  }

  pincodeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    // Check if the pincode is exactly 6 digits long
    const isValid = /^\d{6}$/.test(value);
    return isValid ? null : { invalidPinCode: true };
  }

  districtValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if(!value){
      return {invalidDistrict: 'District is required'}
    }
    return null;
  }

  cityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if(!value){
      return {invalidCity: 'City is required'}
    }
    return null;
  }

  stateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if(!value){
      return {invalidState: 'State is required'}
    }
    return null;
  }

  phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    // Check if the phone number is exactly 10 digits long
    const isValid = /^\d{10}$/.test(value);
    return isValid ? null : { invalidPhoneNumber: true };
  }

  goBack() {
    // this.router.navigate(['/book'], {
    //   state: { reservationDetails: this.reservationDetails },
    // });
  }

  onSubmit() {

    if(!this.customerDetails.customerId){
      console.log("came here")
      this.customerDetails.customerId = this.localStorageService.checkCustomerFromLocalStorage(this.customerFormData.value);
      
      if(this.customerDetails.customerId){
        sessionStorage.setItem('customerId', JSON.stringify(this.customerDetails.customerId));
        this.customerDetails = this.localStorageService.getCustomerFromLocalStorage(this.customerDetails.customerId);
        console.log("checkcomplete",this.customerDetails);
        this.router.navigate(['/payment-details'],{state: {reservationDetails: this.reservationDetails, customerDetails: this.customerDetails}});
      }
      else{
        this.customerDetails.name = this.customerFormData.get('name')?.value;
      this.customerDetails.birthData = new Date(this.customerFormData.get('birthDate')?.value);
      this.customerDetails.pincode = this.customerFormData.get('pincode')?.value;
      this.customerDetails.district = this.customerFormData.get('district')?.value;
      this.customerDetails.city = this.customerFormData.get('city')?.value;
      this.customerDetails.state = this.customerFormData.get('state')?.value;
      this.customerDetails.phoneNumber = this.customerFormData.get('phoneNumber')?.value;
      this.customerDetails.reservationId =  [];

      this.router.navigate(['/payment-details'],{state: {reservationDetails: this.reservationDetails, customerDetails: this.customerDetails}});
      }

    }
    else{
      this.customerDetails.name = this.customerFormData.get('name')?.value;
      this.customerDetails.birthData = new Date(this.customerFormData.get('birthDate')?.value);
      this.customerDetails.pincode = this.customerFormData.get('pincode')?.value;
      this.customerDetails.district = this.customerFormData.get('district')?.value;
      this.customerDetails.city = this.customerFormData.get('city')?.value;
      this.customerDetails.state = this.customerFormData.get('state')?.value;
      this.customerDetails.phoneNumber = this.customerFormData.get('phoneNumber')?.value;
      this.customerDetails.reservationId ?? [];

      this.router.navigate(['/payment-details'],{state: {reservationDetails: this.reservationDetails, customerDetails: this.customerDetails}});

    }

  }
}
