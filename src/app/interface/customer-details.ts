export interface CustomerDetails {
    name: string;
    birthData: Date;
    pincode: number;
    district: string;
    city: string;
    state: string;
    phoneNumber: number;
    bookingId: number[];
    paymentId: number[];
}