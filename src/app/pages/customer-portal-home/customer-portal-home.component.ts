import { Component, OnInit } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../../service/apiService/room-details-api.service';
import { MergeRoomAndRoomDetails } from '../../utils/merge-room-and-room-details.pipe';
import { FilterService } from '../../service/filterService/filter.service';

@Component({
  selector: 'app-customer-portal-home',
  templateUrl: './customer-portal-home.component.html',
  styleUrl: './customer-portal-home.component.scss',
})
export class CustomerPortalHomeComponent implements OnInit {
  public roomAndRoomStayDetails : RoomAndRoomStayDetails[] = [];
  public roomDetailsForFilter : RoomAndRoomStayDetails[] = [];
  public viewRoomData : RoomAndRoomStayDetails = {} as RoomAndRoomStayDetails;

  constructor(
    private roomDetailsApiService: RoomDetailsApiService,
    private mergePipe: MergeRoomAndRoomDetails,
    private filterService: FilterService
  ) {  }

  ngOnInit() {
    this.filterService.setIsCustomer(true);
    this.fetchDataAndApplyFilters();
  }
  
  private fetchDataAndApplyFilters() {
    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe((mergedData) => {
      this.roomDetailsForFilter = mergedData;
      this.filterService.getFilteredRoomStayDetails().subscribe((data) => {
        this.roomAndRoomStayDetails = data;
        console.log("roomDetailsForFilter",this.roomAndRoomStayDetails);
      });
    });
  }

  onViewRoom(viewRoomData: RoomAndRoomStayDetails) {
    this.viewRoomData = viewRoomData;
  }

  clearFilter(){
    this.filterService.resetFilters();
  }
 
}
