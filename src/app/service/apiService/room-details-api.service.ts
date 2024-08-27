import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { RoomStayDetails } from '../../interface/room-stay-details';
import { RoomDetails } from '../../interface/room-details';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { MergeRoomAndRoomDetails } from '../../utils/merge-room-and-room-details.pipe';

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

  findRoomByRoomId(roomId: number): Observable<RoomAndRoomStayDetails[] | undefined> {
    return forkJoin({
      roomStayDetails: this.getRoomStayDetails(),
      roomDetails: this.getRoomDetails(),
    }).pipe(
      map(({ roomStayDetails, roomDetails }) => {
        const mergedData = this.mergePipe.transform(roomStayDetails, roomDetails);
        // Find the room that matches the roomId
        return mergedData.filter(room => room.roomId === roomId);

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
