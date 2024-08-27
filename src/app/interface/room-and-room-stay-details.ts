export interface RoomAndRoomStayDetails {
    roomId: number;
    locationId: number;
    locationName: string;
    roomName: string;
    pricePerDayPerPerson: number;
    guestCapacity: number;
    stayDateFrom: Date;
    stayDateTo: Date;
    arrivalDays: string[];
    departureDays: string[];
    minStay: number;
    maxStay: number;
    imageSrc: string;
}