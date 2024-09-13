export interface RoomAndRoomStayDetails {
    roomId: number;
    locationId: number;
    locationName: string;
    roomName: string;
    pricePerDayPerPerson: number;
    guestCapacity: number;
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
    imageSrc: string;
}