import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import moment, { Moment } from 'moment';


@Component({
  selector: 'app-reservation-dialog-new',
  templateUrl: './reservation-dialog-new.component.html',
  styleUrl: './reservation-dialog-new.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationDialogNewComponent {

  roomsData: RoomAndRoomStayDetails[] = [];
  selectedArrivalDate: Date | null = null;
  selectedDepartureDate: Date | null = null;
  arrivalDates: Date[] = [];
  departureDates: Date[] = [];
  guestsNUmbers: number[] = [];
  selectedGuestsNumber: number = 0;
  
  private _formBuilder = inject(FormBuilder);
  constructor( public dialogRef: MatDialogRef<ReservationDialogNewComponent>,private roomDetailsApiService: RoomDetailsApiService) {
    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {

      let arrivalDatesSet: Set<string> = new Set();
      const curruntDate = moment().startOf('day');

      data.forEach(room => {
        const bookDateFrom = room?.bookDateFrom ? moment(room.bookDateFrom).startOf('day') : moment().startOf('day');
        const bookDateTo = room.bookDateTo ? moment(room.bookDateTo).startOf('day') : moment(room.stayDateTo).startOf('day');
        const stayDateFrom = moment(room.stayDateFrom).startOf('day');
        const stayDateTo = moment(room.stayDateTo).startOf('day');
        const arrivalDays = room?.arrivalDays.map(item => item.toUpperCase());
  
        for(let i = curruntDate.clone(); i <= bookDateTo; i = i.add(1, 'days')) {
          if(i.isBetween(bookDateFrom, bookDateTo, 'day', '[]') && (arrivalDays.length > 0 ? arrivalDays.includes(i.format('ddd').toUpperCase()) : true) && i.isBetween(stayDateFrom.subtract((room.minDeviation ? room.minDeviation : 0), 'days'), stayDateTo.subtract(room.minStay + (room.minDeviation ? room.minDeviation : 0), 'days'), 'day', '[]')) {
            arrivalDatesSet.add(i.format('YYYY-MM-DD'));
          }
        }
      })
      console.log("hbdjhjdshvjsvhjsjhsjhj",arrivalDatesSet);

      this.arrivalDates = Array.from(arrivalDatesSet).map(dateString => moment(dateString, 'YYYY-MM-DD').toDate());;
    })
    console.log("this.arrivalDates",this.arrivalDates);
  }

  isArrivalDateAvailable = (d: Date | null): boolean => {
    if (!d) return false;
    
    const availableDates = this.arrivalDates.map(date => moment(date).startOf('day').format('YYYY-MM-DD'));
    return availableDates.includes(moment(d).startOf('day').format('YYYY-MM-DD'));
  }

  isDepartureDateAvailable = (d: Date | null): boolean => {
    if (!d) {
      return false;
    }
    const availableDates = this.departureDates.map(date => moment(date).startOf('day').format('YYYY-MM-DD'));
    return availableDates.includes(moment(d).startOf('day').format('YYYY-MM-DD'));
  }

  onArrivalDateSelection(selectedDate: Date | null) {
    
    if (!selectedDate) {
      this.dateSelectionGroup.get('departureDate')?.setValue(null);
      return;
    }
    let departureDateSet: Set<string> = new Set();
    this.selectedArrivalDate = selectedDate;

    const curruntDate = moment().startOf('day');
    const arrivalDate = moment(selectedDate).startOf('day');

    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {
      data.forEach(room => {
        const bookDateFrom = room?.bookDateFrom ? moment(room.bookDateFrom).startOf('day') : moment().startOf('day');
        const bookDateTo = room.bookDateTo ? moment(room.bookDateTo).startOf('day') : moment(room.stayDateTo).subtract(1, 'days').startOf('day');
        const stayDateFrom = moment(room.stayDateFrom).startOf('day');
        const stayDateTo = moment(room.stayDateTo).startOf('day');
        const arrivalDays = room?.arrivalDays.map(item => item.toUpperCase());
        const departureDays = room?.departureDays.map(item => item.toUpperCase());

        const minValid = curruntDate.isBefore(arrivalDate.subtract(room.minDeviation ? room.minDeviation : 0, 'days'));
        const maxValid = curruntDate.isAfter(arrivalDate.subtract(room.maxDeviation ? room.maxDeviation : 0, 'days'));

        if((arrivalDays.length > 0 ? arrivalDays.includes(arrivalDate.format('ddd').toUpperCase()) : true) && curruntDate.isBetween(bookDateFrom, bookDateTo, 'day', '[]') && minValid) {
          console.log("came herererererer")
          for(let i = arrivalDate.clone(); i <= stayDateTo; i = i.add(1, 'days')) {
            if((departureDays.length > 0 ? departureDays.includes(i.format('ddd').toUpperCase()) : true) && i.isBetween(stayDateFrom.add(room.minStay, 'days'), stayDateFrom.add(room.maxStay, 'days'), 'day', '[]')) {
              departureDateSet.add(i.format('YYYY-MM-DD'));
            }
          }
        }
      })
      this.departureDates = Array.from(departureDateSet).map(dateString => moment(dateString, 'YYYY-MM-DD').toDate());
    })

  }

  onDepartureDateSelection(selectedDate: Date | null) {
    if (!selectedDate) return;

    this.selectedDepartureDate = selectedDate;

    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {
      
      data.forEach(room => {
        const stayDateFrom = moment(room.stayDateFrom).startOf('day');
        const stayDateTo = moment(room.stayDateTo).startOf('day');
        const arrivalDays = room?.arrivalDays.map(item => item.toUpperCase());
        const departureDays = room?.departureDays.map(item => item.toUpperCase());
        const isMinDaviationValid = room?.minDeviation ? ((moment(this.selectedArrivalDate).diff(stayDateFrom, 'hours')/24) >= room.minDeviation) : true;
        const isMaxDaviationValid = room?.maxDeviation ? ((moment(this.selectedArrivalDate).diff(stayDateFrom, 'hours')/24) <= room.maxDeviation) : true;

        if((arrivalDays.length > 0 ? arrivalDays.includes(moment(this.selectedArrivalDate).format('ddd').toUpperCase()) : true) && (departureDays.length > 0 ? departureDays.includes(moment(this.selectedDepartureDate).format('ddd').toUpperCase()) : true) && isMinDaviationValid && isMaxDaviationValid){
          const numberOfDays = Math.ceil(moment(this.selectedDepartureDate).hours(10).diff(moment(this.selectedArrivalDate).hours(11), 'hours')/24);

          if(numberOfDays >= room.minStay && numberOfDays <= room.maxStay){
            this.roomsData.push(room);
          }
        }
      })

      if(this.selectedArrivalDate && this.selectedDepartureDate && this.roomsData.length > 0){
        this.guestsNUmbers = [];
        const maxGuest = Math.max(...this.roomsData.map(room => room.guestCapacity));
        for (let i = 1; i <= maxGuest; i++) {
          this.guestsNUmbers.push(i);
        }
      }
    })
  }

  onGuestSelection(guests: number) {
    this.selectedGuestsNumber = guests;
    
  }

  dateSelectionGroup = this._formBuilder.group({
    arrivalDate: ['', Validators.required],
    departureDate: ['', Validators.required],
    guests: ['', Validators.required],
  });


  secondFormGroup = this._formBuilder.group({
    
  });

  close() {
    this.dialogRef.close();
  }

  showArrival(){
    console.log("arrrrrr",this.arrivalDates);
    console.log("departuuuuuuuuuuuu",this.departureDates);
    console.log("selectedArrivalDate",this.selectedArrivalDate);
    console.log("selectedDepartureDate",this.selectedDepartureDate);
    console.log("roomData",this.roomsData);
  }
}
