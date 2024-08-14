import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { RoomStayDetails } from '../../interface/room-stay-details';
import { RoomDetails } from '../../interface/room-details';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../../service/apiService/room-details-api.service';
import { MergeRoomAndRoomDetails } from '../../utils/merge-room-and-room-details.pipe';

@Component({
  selector: 'app-customer-portal-home',
  templateUrl: './customer-portal-home.component.html',
  styleUrl: './customer-portal-home.component.scss',
})
export class CustomerPortalHomeComponent implements OnInit {
  public roomStayDetails$!: Observable<RoomStayDetails[]>;
  public roomDetails$!: Observable<RoomDetails[]>;
  public roomAndRoomStayDetails : RoomAndRoomStayDetails[] = [];
  public roomDetailsForFilter : RoomAndRoomStayDetails[] = [];
  public viewRoomData : RoomAndRoomStayDetails = {} as RoomAndRoomStayDetails;

  constructor(
    private roomDetailsApiService: RoomDetailsApiService,
    private mergePipe: MergeRoomAndRoomDetails
  ) {}

  ngOnInit() {
    forkJoin({
      roomStayDetails: this.roomDetailsApiService.getRoomStayDetails(),
      roomDetails: this.roomDetailsApiService.getRoomDetails(),
    }).subscribe(({ roomStayDetails, roomDetails }) => {
      this.roomAndRoomStayDetails = this.mergePipe.transform(
        roomStayDetails,
        roomDetails
      ),
      this.roomDetailsForFilter = this.roomAndRoomStayDetails
      console.log('mergePipe', this.roomAndRoomStayDetails);
      console.log('roomDetailsForFilter', this.roomDetailsForFilter);
    });
  }

  onFilterChange(selectedLocation: number) {
    console.log("onFilterChange",selectedLocation);
    try{
      forkJoin({
        roomStayDetails: this.roomDetailsApiService.getRoomStayDetails(),
        roomDetails: this.roomDetailsApiService.getRoomDetails(),
      }).subscribe(({ roomStayDetails, roomDetails }) => {
        this.roomAndRoomStayDetails = this.mergePipe.transform(
          roomStayDetails,
          roomDetails
        );
        console.log('onfilterchange initial data', this.roomAndRoomStayDetails);
        if(selectedLocation){
          this.roomAndRoomStayDetails = this.roomAndRoomStayDetails?.filter(room => room.locationId == selectedLocation);
          console.log('onfiltercgange filtered data on location', this.roomAndRoomStayDetails);
        }
      });
      
    }
    catch(error){
      console.log(error);
    }
  }

  onPriceChanged(newPrice: number) {
    console.log('Price changed:', newPrice);
    // Handle the price value here
  }

  onGuestChange(guestNo: number) {
    console.log('Guest changed:', guestNo);
  }

  onViewRoom(viewRoomData: RoomAndRoomStayDetails) {
    console.log("view room outer", viewRoomData)
    this.viewRoomData = viewRoomData;
  }
}
