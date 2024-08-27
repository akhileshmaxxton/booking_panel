export interface CustomerDetails {
    customerId: string;
    birthData: Date;
    firstName: string;
    middleName: string;
    lastName: string;
    country: string;
    state: string;
    city: string;
    pincode: number;
    phoneNumber: number;
    
    reservationIds: string[];
}