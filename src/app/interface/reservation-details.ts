export interface ReservationDetails {
    reservationId: string;
    roomId: number;
    locationId: number;
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    pricePerDayPerPerson: number;
    numberOfDays: number;
    totalAmount: number;
    paymentId: any[];
    customerId: string;
}