import { Injectable } from '@angular/core';
import { CustomerDetails } from '../../interface/customer-details';
import { ReservationDetails } from '../../interface/reservation-details';
import { PaymentDetails } from '../../interface/payment-details';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setLocalStorage(customerDetails: CustomerDetails, reservationDetails: ReservationDetails, paymentDetails: PaymentDetails) {
    const customer = localStorage.getItem('customer')? JSON.parse(localStorage.getItem('customer')!) : [];
    const reservation = localStorage.getItem('reservation')? JSON.parse(localStorage.getItem('reservation')!) : [];
    const payment = localStorage.getItem('payment')? JSON.parse(localStorage.getItem('payment')!) : [];
    if(customerDetails.customerId){
      customer.find((customer: CustomerDetails) => customer.customerId === customerDetails.customerId).reservationId.push(reservationDetails.reservationId);
    }
    else{
      customer.push(customerDetails);

    }
    reservation.push(reservationDetails);
    payment.push(paymentDetails);
    localStorage.setItem('customer', JSON.stringify(customer));
    localStorage.setItem('reservation', JSON.stringify(reservation));
    localStorage.setItem('payment', JSON.stringify(payment));
    sessionStorage.setItem('customerId', JSON.stringify(customerDetails.customerId));
  }

  getCustomerFromSession(){
    const customerId = sessionStorage.getItem('customerId')? JSON.parse(sessionStorage.getItem('customerId')!) : '';
    return customerId;
  }

  getCustomerFromLocalStorage(customerID : string){
    const customer = localStorage.getItem('customer')? JSON.parse(localStorage.getItem('customer')!) : [];
    return customer.find((customer: CustomerDetails) => customer.customerId === customerID);
  }

  checkCustomerFromLocalStorage(customerData: any) {
    const customers = JSON.parse(localStorage.getItem('customer') || '[]');
  
    for (let customer of customers) {
      if (
        customer.name === customerData.name &&
        moment(customer.birthData).format('YYYY-MM-DD') === moment(customerData.birthData).format('YYYY-MM-DD') &&
        customer.pincode === customerData.pincode &&
        customer.district === customerData.district &&
        customer.city === customerData.city &&
        customer.state === customerData.state &&
        customer.phoneNumber === customerData.phoneNumber
      ) {
        return customer.customerId;
      }
    }
  
    return null;
  }
  
}
