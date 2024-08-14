export interface PaymentDetails {
    paymentId: string;
    reservationId: string;
    customerId: string;
    paymentDate: Date;
    paymentAmount: number;
    paymentMode: string;

}