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
    const customer = localStorage.getItem('customers') ? JSON.parse(localStorage.getItem('customers')!) : [];
    const reservation = localStorage.getItem('reservations') ? JSON.parse(localStorage.getItem('reservations')!) : [];
    const payment = localStorage.getItem('payments') ? JSON.parse(localStorage.getItem('payments')!) : [];
    if(customerDetails?.customerId === customer?.find((customer: CustomerDetails) => customer.customerId === customerDetails.customerId)?.customerId){
      console.log("Customer ID:", customerDetails.customerId);
      customer?.find((customer: CustomerDetails) => customer.customerId === customerDetails.customerId)?.reservationIds.push(reservationDetails.reservationId);
    }
    else{
      console.log("came here for else")
      customer.push(customerDetails);
    }
    reservation.push(reservationDetails);
    payment.push(paymentDetails);
    localStorage.setItem('customers', JSON.stringify(customer));
    localStorage.setItem('reservations', JSON.stringify(reservation));
    localStorage.setItem('payments', JSON.stringify(payment));
  }

  getCustomerFromLocalStorage(customerID : string){
    const customer = localStorage.getItem('customers')? JSON.parse(localStorage.getItem('customers')!) : [];
    return customer.find((customer: CustomerDetails) => customer.customerId === customerID);
  }

  checkCustomerFromLocalStorage(customerData: any) {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
  
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
        return customer;
      }
    }
  
    return null;
  }

  getAllReservationsFromLocalStorage(){
    return localStorage.getItem('reservations')? JSON.parse(localStorage.getItem('reservations')!) : [];
  }

  getAllPaymentsFromLocalStorage(){
    return localStorage.getItem('payments')? JSON.parse(localStorage.getItem('payments')!) : [];
  }

  getAllCustomersFromLocalStorage(){
    return localStorage.getItem('customers')? JSON.parse(localStorage.getItem('customers')!) : [];
  }

  getReservationsById(roomId: number | undefined){
    const reservations = localStorage.getItem('reservations')? JSON.parse(localStorage.getItem('reservations')!) : [];
    return reservations.filter((reservation: ReservationDetails) => reservation.roomId === roomId);
  }

  setReservations(reservations: ReservationDetails[]){
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }

  getReservationByRoomId(roomId: number | undefined){
    const reservations = localStorage.getItem('reservations')? JSON.parse(localStorage.getItem('reservations')!) : [];
    return reservations.filter((reservation: ReservationDetails) => reservation.roomId === roomId);
  }

  setReservationStatus() {
    const reservations: ReservationDetails[] = localStorage.getItem('reservations') ? JSON.parse(localStorage.getItem('reservations')!) : [];
    
    const currentDate = new Date();
  
    reservations.forEach(reservation => {
      const checkInDate = new Date(reservation.checkIn);
      const checkOutDate = new Date(reservation.checkOut);
  
      if (currentDate < checkInDate) {
        reservation.status = 'Confirmed';
      } else if (currentDate >= checkInDate && currentDate <= checkOutDate) {
        reservation.status = 'Check-In';
      } else if (currentDate > checkOutDate) {
        reservation.status = 'Check-Out';
      }
    });
  
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }

  getCustomerById(customerId: string){
    const customers = localStorage.getItem('customers')? JSON.parse(localStorage.getItem('customers')!) : [];
    return customers.find((customer: CustomerDetails) => customer.customerId === customerId);
  }

  getPaymentById(paymentId: string){
    const payments = localStorage.getItem('payments')? JSON.parse(localStorage.getItem('payments')!) : [];
    return payments.find((payment: PaymentDetails) => payment.paymentId === paymentId);
  }
  
  
}
