export interface ReservationDetails {
    reservationId: string;
    locationId: number;
    roomId: number;
    customerId: string;
    checkIn: Date;
    checkOut: Date;
    reservationDate: Date;
    totalAmount: number;
    status: string;
    paidAmount: number;
    numberOfGuests: number;
    
    pricePerDayPerPerson: number;
    numberOfDays: number;
    paymentIds: string[];
}