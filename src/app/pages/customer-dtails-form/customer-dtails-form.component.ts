import { Component, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CustomerDetails } from '../../interface/customer-details';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';
import moment from 'moment';

@Component({
  selector: 'app-customer-dtails-form',
  templateUrl: './customer-dtails-form.component.html',
  styleUrls: ['./customer-dtails-form.component.scss'],
})
export class CustomerDtailsFormComponent {

  public customerFormData!: FormGroup;
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

  @Output() customerDetailsSubmitted = new EventEmitter<CustomerDetails>();
  @Output() backToBookingForm = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private localStorageService: LocalStorageService) {
    this.initializeForm();
  }

  private initializeForm() {
    this.customerFormData = this.fb.group({
      name: ['', [Validators.required, this.nameValidator]],
      birthDate: ['', [Validators.required, this.birthDateValidator]],
      pincode: ['', [Validators.required, this.pincodeValidator]],
      district: ['', [Validators.required, this.districtValidator]],
      city: ['', [Validators.required, this.cityValidator]],
      state: ['', [Validators.required, this.stateValidator]],
      phoneNumber: ['', [Validators.required, this.phoneNumberValidator]],
    });
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidName: 'Name is required' } : null;
  }

  birthDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidBirthDate: 'Birth Date is required' } : null;
  }

  pincodeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const isValid = /^\d{6}$/.test(value);
    return !isValid ? { invalidPincode: 'Pincode must be a 6-digit number' } : null;
  }

  districtValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidDistrict: 'District is required' } : null;
  }

  cityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidCity: 'City is required' } : null;
  }

  stateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidState: 'State is required' } : null;
  }

  phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const isValid = /^\d{10}$/.test(value);
    return !isValid ? { invalidPhoneNumber: 'Phone Number must be a 10-digit number' } : null;
  }

  goBack() {
    this.backToBookingForm.emit();
  }

  onSubmit() {
    if (this.customerFormData.invalid) {
      return;
    }

    const existingCustomer = this.localStorageService.checkCustomerFromLocalStorage(this.customerFormData.value);
    
    if (existingCustomer) {
      this.customerDetails.customerId = existingCustomer.customerId;
    } else {
      this.customerDetails = {
        ...this.customerDetails,
        ...this.customerFormData.value,
        birthData: new Date(this.customerFormData.get('birthDate')?.value),
        reservationId: [],
      };
    }

    this.customerDetailsSubmitted.emit(this.customerDetails);
  }
}
