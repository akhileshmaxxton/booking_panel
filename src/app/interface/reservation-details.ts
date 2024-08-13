export interface ReservationDetails {
    reservationId: number;
    roomId: number;
    locationId: number;
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    pricePerDayPerPerson: number;
    numberOfDays: number;
    totalAmount: number;
}