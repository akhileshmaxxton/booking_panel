import { Component, Output, EventEmitter, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CustomerDetails } from '../../interface/customer-details';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';
import moment from 'moment';
import { FilterService } from '../../service/filterService/filter.service';

@Component({
  selector: 'app-customer-dtails-form',
  templateUrl: './customer-dtails-form.component.html',
  styleUrls: ['./customer-dtails-form.component.scss'],
})
export class CustomerDtailsFormComponent {

  maxDate = new Date().toISOString().split('T')[0];

  public customerFormData!: FormGroup;
  public customerDetails: CustomerDetails = {
    customerId: '',
    birthData: new Date(),
    firstName: '',
    middleName: '',
    lastName: '',
    country: '',
    state: '',
    city: '',
    pincode: 0,
    phoneNumber: 0,
    reservationIds: [],
  };
  @Input() submittedCustomerDetails!: CustomerDetails;
  @Output() customerDetailsSubmitted = new EventEmitter<CustomerDetails>();
  @Output() backToBookingForm = new EventEmitter<void>();

  customersForDropDown?: CustomerDetails[] = [];

  constructor(private fb: FormBuilder, private localStorageService: LocalStorageService, private filterService: FilterService) {  
    this.initializeForm();
  }

  ngOnInit(){
    if(this.submittedCustomerDetails) {
      this.customerFormData.patchValue({
        firstName: this.submittedCustomerDetails.firstName,
        middleName: this.submittedCustomerDetails.middleName,
        lastName: this.submittedCustomerDetails.lastName,
        birthDate: this.submittedCustomerDetails.birthData,
        country: this.submittedCustomerDetails.country,
        state: this.submittedCustomerDetails.state,
        city: this.submittedCustomerDetails.city,
        pincode: this.submittedCustomerDetails.pincode,
        phoneNumber: this.submittedCustomerDetails.phoneNumber,
      });
    }

    if(!this.getIsCustomerFromService()){
      this.customersForDropDown = this.localStorageService.getAllCustomersFromLocalStorage() ?? [];
    }
  }

  
  getIsCustomerFromService() {
    return this.filterService.getIsCustomer();
  }

  onCustomerSelect(customerId: string) {
    const customer = this.customersForDropDown?.find(customer => customer.customerId === customerId);
    if(customer) {
      this.customerFormData.patchValue({
        firstName: customer.firstName,
        middleName: customer.middleName,
        lastName: customer.lastName,
        birthDate: customer.birthData,
        country: customer.country,
        state: customer.state,
        city: customer.city,
        pincode: customer.pincode,
        phoneNumber: customer.phoneNumber,
      });
    }
  }

  private initializeForm() {
    this.customerFormData = this.fb.group({
      firstName: ['', [Validators.required, this.nameValidator]],
      middleName: [''],
      lastName: ['', [Validators.required, this.nameValidator]],
      birthDate: ['', [Validators.required, this.birthDateValidator]],
      country: ['', [Validators.required, this.countryValidator]],
      state: ['', [Validators.required, this.stateValidator]],
      city: ['', [Validators.required, this.cityValidator]],
      pincode: ['', [Validators.required, this.pincodeValidator]],
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

  countryValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidCountry: 'Country is required' } : null;
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
      alert('Please fill all the required fields');
      return;
    }

    const existingCustomer = this.localStorageService.checkCustomerFromLocalStorage(this.customerFormData.value);

    this.customerDetails = {
      ...this.customerDetails,
      customerId : existingCustomer ? existingCustomer.customerId : '',
      birthData : new Date(this.customerFormData?.get('birthDate')?.value),
      firstName : this.customerFormData?.get('firstName')?.value,
      middleName : this.customerFormData?.get('middleName')?.value,
      lastName : this.customerFormData?.get('lastName')?.value,
      country : this.customerFormData?.get('country')?.value,
      state : this.customerFormData?.get('state')?.value,
      city : this.customerFormData?.get('city')?.value,
      pincode : this.customerFormData?.get('pincode')?.value,
      phoneNumber : this.customerFormData?.get('phoneNumber')?.value,
      reservationIds: existingCustomer ? existingCustomer.reservationId : [],
    }

    this.customerDetailsSubmitted.emit(this.customerDetails);
  }
}
