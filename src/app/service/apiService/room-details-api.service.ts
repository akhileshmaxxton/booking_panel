import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { RoomStayDetails } from '../../interface/room-stay-details';
import { RoomDetails } from '../../interface/room-details';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { MergeRoomAndRoomDetails } from '../../utils/merge-room-and-room-details.pipe';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class RoomDetailsApiService {

  private roomStayDetailsUrl = 'https://jadhavsudhit.github.io/Booking-module/stays.json';
  private roomDetailsUrl = 'https://jadhavsudhit.github.io/Booking-module/rooms.json';
  
  constructor(private http: HttpClient, private mergePipe: MergeRoomAndRoomDetails) { }

  getRoomStayDetails(): Observable<RoomStayDetails[]> {
    return this.http.get<RoomStayDetails[]>(this.roomStayDetailsUrl);
  }

  getRoomDetails(): Observable<RoomDetails[]> {
    return this.http.get<RoomDetails[]>(this.roomDetailsUrl);
  }

  findRoomByRoomId(roomId: number): Observable<RoomAndRoomStayDetails | undefined> {
    return forkJoin({
      roomStayDetails: this.getRoomStayDetails(),
      roomDetails: this.getRoomDetails(),
    }).pipe(
      map(({ roomStayDetails, roomDetails }) => {
        let mergedData = this.mergePipe.transform(roomStayDetails, roomDetails);

        let filteredData = mergedData.filter(room => room.roomId === roomId);

        if(filteredData.length === 1) {
          return filteredData[0];
        }

        const mergedRoom: RoomAndRoomStayDetails = {
          roomId: filteredData[0]?.roomId,
          locationId: filteredData[0]?.locationId,
          locationName: filteredData[0]?.locationName,
          roomName: filteredData[0]?.roomName,
          pricePerDayPerPerson: filteredData[0]?.pricePerDayPerPerson,
          guestCapacity: Math.max(...filteredData.map(room => room.guestCapacity)),
          stayDateFrom: moment.min(filteredData.map(room => moment(room.stayDateFrom))).toDate(),
          stayDateTo: moment.max(filteredData.map(room => moment(room.stayDateTo))).toDate(),
          arrivalDays: Array.from(new Set(filteredData.flatMap(room => room.arrivalDays))),
          departureDays: Array.from(new Set(filteredData.flatMap(room => room.departureDays))),
          minStay: Math.min(...filteredData.map(room => room.minStay)),
          maxStay: Math.max(...filteredData.map(room => room.maxStay)),
          imageSrc: filteredData[0]?.imageSrc,
          bookDateFrom: null,
          bookDateTo: null,
          minDeviation: null,
          maxDeviation: null
        };

        return mergedRoom;

      })
    );
  }

  fetchAllDataForCustomerPortal(){
    return forkJoin({
      roomStayDetails: this.getRoomStayDetails(),
      roomDetails: this.getRoomDetails(),
    }).pipe(
      map(({ roomStayDetails, roomDetails }) => {
        const mergedData = this.mergePipe.transform(roomStayDetails, roomDetails);
        return mergedData;
      })
    );
  }
}
