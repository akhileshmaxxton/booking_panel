export interface BookingDetails {
    customerId: number;
    name: string;
    birthDate: Date;
    address: {
        pinCode: number;
        district: string;
        city: string;
        state: string;
        country: string;
    };
    reservationInfo: [
        {
            reservationId: number;
            roomId: number;
            selectedStayDateFrom: Date;
            selectedStayDateTo: Date;
            numberOfDays: number;
            numberOfGuests: number;
            pricePerDayPerPerson: number;
            totalAmount: number;
        }
    ];
    paymentInfo: [
        {
            paymentId: number;
            paymentMode: string;
            paidAmount: number;
        }
    ];
    totalAmount: number;
    totalAmountPaid: number;
    totalAmountDue: number;

}