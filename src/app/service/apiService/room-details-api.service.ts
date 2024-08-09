import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomStayDetails } from '../../interface/room-stay-details';
import { RoomDetails } from '../../interface/room-details';

@Injectable({
  providedIn: 'root'
})
export class RoomDetailsApiService {

  roomStayDetailsUrl = 'https://jadhavsudhit.github.io/Booking-module/stays.json';
  roomDetailsUrl = 'https://jadhavsudhit.github.io/Booking-module/rooms.json';
  
  constructor(private http: HttpClient) { }

  getRoomStayDetails(): Observable<RoomStayDetails[]> {
    return this.http.get<RoomStayDetails[]>(this.roomStayDetailsUrl);
  }

  getRoomDetails(): Observable<RoomDetails[]> {
    return this.http.get<RoomDetails[]>(this.roomDetailsUrl);
  }
}
