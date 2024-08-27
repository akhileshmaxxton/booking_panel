import { Pipe, PipeTransform } from '@angular/core';
import { RoomStayDetails } from '../interface/room-stay-details';
import { RoomDetails } from '../interface/room-details';
import { RoomAndRoomStayDetails } from '../interface/room-and-room-stay-details';

@Pipe({
  name: 'mergeRoomAndRoomDetails',
})
export class MergeRoomAndRoomDetails implements PipeTransform {
  transform(
    roomStayDetails: RoomStayDetails[],
    roomDetails: RoomDetails[]
  ): RoomAndRoomStayDetails[] {
    return roomStayDetails
      .map((stayDetail) => {
        const roomDetail = roomDetails.find(
          (detail) => detail.roomId === stayDetail.roomId
        );
        if (roomDetail) {
          return {
            roomId: roomDetail.roomId,
            locationId: roomDetail.locationId,
            locationName: roomDetail.locationName,
            roomName: roomDetail.roomName,
            pricePerDayPerPerson: roomDetail.pricePerDayPerPerson,
            guestCapacity: roomDetail.guestCapacity,
            stayDateFrom: stayDetail.stayDateFrom,
            stayDateTo: stayDetail.stayDateTo,
            arrivalDays: stayDetail.arrivalDays,
            departureDays: stayDetail.departureDays,
            minStay: stayDetail.minStay,
            maxStay: stayDetail.maxStay,
            imageSrc: this.getRandomImagePath(),
          } as RoomAndRoomStayDetails;
        }
        return null;
      })
      .filter((detail) => detail !== null) as RoomAndRoomStayDetails[];
  }


  getRandomImagePath(): string {
    const randomNumber = Math.floor(Math.random() * 4) + 1; 
    return `/assets/images/room${randomNumber}.jpg`;
  }
}
