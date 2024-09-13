export interface RoomStayDetails {
    roomId: number;
    bookDateFrom: Date | null;
    bookDateTo: Date | null;
    stayDateFrom: Date;
    stayDateTo: Date;
    arrivalDays: string[];
    departureDays: string[];
    minDeviation: number | null;
    maxDeviation: number | null;
    minStay: number;
    maxStay: number;
}


