import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { LocalStorageService } from '../../../service/localStorageApi/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UniquePipe } from '../../../utils/unique.pipe';
import { FilterService } from '../../../service/filterService/filter.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';

declare var bootstrap: any;

interface cellDetails {
  roomId: number;
  day: Date;
}

@Component({
  selector: 'app-planning-chart',
  templateUrl: './planning-chart.component.html',
  styleUrl: './planning-chart.component.scss',
})
export class PlanningChartComponent implements OnInit, AfterViewInit {

  public rooms: RoomAndRoomStayDetails[] = []; 
  public roomsData?: RoomAndRoomStayDetails[];
  public roomDetailsForFilter : RoomAndRoomStayDetails[] = [];
  public viewRoomData : RoomAndRoomStayDetails = {} as RoomAndRoomStayDetails;

  months: { month: Date; days: Date[] }[] = [];
  isMouseDown = false;
  selectedCells: Map<string, cellDetails> = new Map();
  arrivalDaysForMouseOver: Map<string, cellDetails> = new Map();
  departureDaysForMouseOver: Map<string, cellDetails> = new Map();

  @ViewChild('scrollSentinelNext') scrollSentinelNext?: ElementRef;
  @ViewChild('scrollSentinelPrev') scrollSentinelPrev?: ElementRef;
  observer?: IntersectionObserver;
  options = { rootMargin: '200px', threshold: 0.1 }; 

  private startSelectionDate: Date | null = null;
  private endSelectionDate: Date | null = null;
  private selectionRowId: number | null = null;

  constructor(private roomDetailsApiService: RoomDetailsApiService, private uniquePipe: UniquePipe, private localStorageApiService: LocalStorageService, private router: Router, private route: ActivatedRoute, private filterService: FilterService, private snackBar: MatSnackBar) {
    this.initCurrentMonth();
  }

  ngOnInit() {
    this.fetchDataAndApplyFilters();
  }

  ngAfterViewInit() {
    this.initObservers();
  }

  private fetchDataAndApplyFilters() {
    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe((mergedData) => {
      this.roomDetailsForFilter = mergedData;
      this.roomsData = mergedData;
      this.filterService.getFilteredRoomStayDetails().subscribe((data) => {
        this.rooms = data;
        this.rooms = this.uniquePipe.transform(this.rooms, 'roomId');
      });
    });
  }

  onViewRoom(viewRoomData: RoomAndRoomStayDetails) {
    this.viewRoomData = viewRoomData;
  }

  clearFilter(){
    this.filterService.resetFilters();
  }

  initObservers() {
    this.observer = new IntersectionObserver(this.handleObserver.bind(this), this.options);
    if (this.scrollSentinelNext?.nativeElement) {
      this.observer.observe(this.scrollSentinelNext.nativeElement);
    }
    if (this.scrollSentinelPrev?.nativeElement) {
      this.observer.observe(this.scrollSentinelPrev.nativeElement);
    }
  }

  //----------HANDLES INTERSECTION OBSERVER - START----------
  handleObserver(entries: IntersectionObserverEntry[]) {
    let shouldLoadNextMonth = false;
    let shouldLoadPreviousMonth = false;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target === this.scrollSentinelNext?.nativeElement) {
          shouldLoadNextMonth = true;
        } else if (entry.target === this.scrollSentinelPrev?.nativeElement) {
          shouldLoadPreviousMonth = true;
        }
      }
    });

    if (shouldLoadNextMonth && !shouldLoadPreviousMonth) {
      setTimeout(() => this.loadNextMonth(), 300); 
    } else if (shouldLoadPreviousMonth && !shouldLoadNextMonth) {
      setTimeout(() => this.loadPreviousMonth(), 300);
    }
  }

  initCurrentMonth() {
    const currentMonth = new Date();
    this.months = []; 
    this.addMonth(currentMonth);
  }

  addMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const daysInMonth = this.generateDaysInMonth(date, 1, numDays);
    this.months.push({ month: new Date(year, month), days: daysInMonth });


   
    setTimeout(() => {
      document.querySelector('.booking-chart-container')?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100);
  }

  
  loadNextMonth() {
    const lastMonth = this.months[this.months.length - 1].month;
    const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);
    this.addMonth(nextMonth);
  }

  loadPreviousMonth() {
    const firstMonth = this.months[0].month;
    const prevMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() - 1, 1);
    const numDays = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
    this.months.unshift({ month: prevMonth, days: this.generateDaysInMonth(prevMonth, 1, numDays) });
  }

  generateDaysInMonth(date: Date, startDay: number, endDay: number): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    endDay = Math.min(endDay, numDays);
    return Array.from({ length: endDay - startDay + 1 }, (_, i) => new Date(year, month, startDay + i));
  }
  //----------HANDLES INTERSECTION OBSERVER - END----------

  //----------DATA HANDLING FOR LOCAL STORAGE - START-----------------
  isStartOfReservation(roomId: number, day: Date): boolean {
    const selectedDay = moment(day);
    const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
    const reservation = reservations.find((reservation: { checkIn: moment.MomentInput; }) => moment(reservation.checkIn).isSame(selectedDay, 'day'));
    return !!reservation;
  }

  isMiddleOfReservation(roomId: number, day: Date): boolean {
    const selectedDay = moment(day);
    const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
    const reservation = reservations.find((reservation: { checkIn: moment.MomentInput; checkOut: moment.MomentInput; }) => selectedDay.isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '()'));
    return !!reservation;
  }

  
  isEndOfReservation(roomId: number, day: Date): boolean {
    const selectedDay = moment(day);
    const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
    const reservation = reservations.find((reservation: { checkOut: moment.MomentInput; }) => moment(reservation.checkOut).isSame(selectedDay, 'day'));
    return !!reservation;
  }

  isDateInReservation(date: moment.Moment, roomId: number): boolean {
    const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
    const reservation = reservations.find((reservation: { checkIn: moment.MomentInput; checkOut: moment.MomentInput; }) => date.isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '[]'));
    return !!reservation;

  }
  //----------DATA HANDLING FOR LOCAL STORAGE - END-----------------

  //----------EVENT HANDLERS - START-----------------

  onMouseOut() {
    this.arrivalDaysForMouseOver.clear();
    this.departureDaysForMouseOver.clear();
  }

  onMouseDown(roomId: number, day: Date, event: MouseEvent) {
    event.preventDefault();

    if(!this.isMouseDown) {
      if(this.isMiddleOfReservation(roomId, day) || this.isStartOfReservation(roomId, day)) {
        this.openSnackBar('This date is already reserved.', 'Close');
        this.isMouseDown = false;
        this.departureDaysForMouseOver.clear();
        this.selectedCells.clear();
        return;
      }
      this.isMouseDown = true;
      this.selectionRowId = roomId; 
      this.startSelectionDate = day;
      this.endSelectionDate = day; 
      
      this.selectedCells.clear();
      this.updateSelection(roomId);
      this.departureDaysForMouseOver.clear();
     
      this.findDepartureDates(roomId, day);
      console.log("departureDaysForMouseOver",[...this.departureDaysForMouseOver]);
      if(this.departureDaysForMouseOver.size > 0 && this.isMouseDown) {
        this.arrivalDaysForMouseOver.clear();
      }
    }

  }

  onMouseOver(roomId: number, day: Date, event: MouseEvent) {
    if(!this.isMouseDown) {
      this.arrivalDaysForMouseOver.clear();
      this.findArrivalDates(roomId);

      //-----adjust later for the tooltip-----
      if(this.isDateInReservation(moment(day),roomId)){
        this.getTooltipText(roomId,day);
      }
    }
   
  }

  onMouseMove(roomId: number, day: Date, event: MouseEvent) {
    if (this.isMouseDown) {
      this.endSelectionDate = day;
      this.updateSelection(roomId);
    }
  
  }
  
  onMouseUp(roomId: number, day: Date, event: MouseEvent) {
    console.log("selected cell",this.selectedCells);
    this.isMouseDown = false;
    if(!this.isMouseDown){
     this. navigateWithSelectedData();
    }
  }

  //----------EVENT HANDLERS - END ------------------
  getTooltipText(roomId: number, day: Date): string {
    const booking = this.localStorageApiService.getReservationsById(roomId);
    if(booking){
      return `Booked on ${moment(booking[0].reservationDate).format('DD-MM-YYYY')} \nFrom ${moment(booking[0].checkIn).format('DD-MM-YYYY')} to ${moment(booking[0].checkOut).format('DD-MM-YYYY')} \nFor ${booking[0].numberOfGuests} guests.`;
    }
    return '';
  }
  
  private updateSelection(roomId: number) {
    const startCell = moment(this.startSelectionDate);
    const endCell = moment(this.endSelectionDate);
  
    this.selectedCells.clear();
  
    this.months.forEach(month => {
      month.days.forEach(day => {
        const dayMoment = moment(day);
  
        if (dayMoment.isBetween(startCell, endCell, undefined, '[]')) {
          const key = `${this.selectionRowId ?? 0}_${dayMoment.format('YYYY-MM-DD')}`;
          this.selectedCells.set(key, { roomId: this.selectionRowId ?? 0, day: dayMoment.toDate() });
        }
      });
    });
  }
  
  isSelected(roomId: number, day: Date): boolean {
    // if (this.isNotAvailable(roomId, day) || this.isStartOfReservation(roomId, day) || this.isEndOfReservation(roomId, day) || this.isMiddleOfReservation(roomId, day)) return false;
    
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.selectedCells.has(key);
  }
  
  
  isEndOfMonth(day: Date): boolean {
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    return nextDay.getDate() === 1;
  }


  navigateWithSelectedData() {
    return;
    if (this.selectedCells.size > 0) {
      const selectedArray = Array.from(this.selectedCells.values());

      const startCell = selectedArray[0];
      const endCell = selectedArray[selectedArray.length - 1];

      const roomId = startCell.roomId;
      const checkInDate = startCell.day;
      const checkOutDate = endCell.day;

      this.filterService.setDateRange(moment(checkInDate).toDate(), moment(checkOutDate).toDate());
      
      this.router.navigate(['/booking'], {
        relativeTo: this.route,
        queryParams: { 
          roomId: roomId 
        }
      });
    
    } else {
      console.error('No cells selected.');
    }
  }

  //-------------------------UTILITIES-----------------------
  isNotAvailable(roomId: number, day: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) {
      return true;
    }
    return true;
  }

  isArrivalCell(roomId: number, day: Date): boolean {
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.arrivalDaysForMouseOver.has(key);
  }

  isDepartureCell(roomId: number, day: Date): boolean {
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.departureDaysForMouseOver.has(key);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'top',
    });
  }

  findArrivalDates(roomId: number) {
    const today = moment().startOf('day');
    this.roomsData?.filter(room => room.roomId === roomId)?.forEach(room => {
      const stayDateFrom = moment(room.stayDateFrom);
      const stayDateTo = moment(room.stayDateTo);
    
      for (let date = stayDateFrom; date <= stayDateTo; date = date.add(1, 'days')) {
        if (date.isAfter(today) && room.arrivalDays.includes(date.format('ddd').toUpperCase()) && !this.isMiddleOfReservation(roomId, date.toDate()) && !this.isStartOfReservation(roomId, date.toDate())) {
          const key = `${roomId}_${date.format('YYYY-MM-DD')}`;
          this.arrivalDaysForMouseOver.set(key, { roomId, day: date.toDate() });
        }
      }
    });
  }

  findDepartureDates(roomId: number, day: Date) {
    this.roomsData?.filter(room => room.roomId === roomId)?.forEach(room => {
      const stayDateFrom = moment(room.stayDateFrom);
      const stayDateTo = moment(room.stayDateTo);
      const selectedDay = moment(day);

      if (selectedDay.isBetween(stayDateFrom, stayDateTo, 'days', '[]')) {
        for (let date = selectedDay.clone(); date.isSameOrBefore(stayDateTo); date.add(1, 'days')) {
          if(!this.isDateInReservation(date, roomId)) {
            const dayOfWeek = date.format('ddd').toUpperCase();
            if (room.departureDays.includes(dayOfWeek)) {
              const daysFromSelection = date.diff(selectedDay, 'days') + 1; 
              if (daysFromSelection >= room.minStay && daysFromSelection <= room.maxStay) {
                const cellDetail: cellDetails = {
                  roomId: room.roomId,
                  day: date.toDate(),
                };
                this.departureDaysForMouseOver.set(`${roomId}_${date.format('YYYY-MM-DD')}`, cellDetail);
                
              } else {
                break;
              }
            }
          }
        }
      }
    });
  }

  getReservationWidth(roomId: number, startDay: Date): string {
    const reservationLength = this.getReservationLength(roomId, startDay) + 1;
    const cellWidth = 4; 
  
    return `calc(${reservationLength} * ${cellWidth}vw)`;
  }
  
  getReservationLength(roomId: number, startDay: Date): number {
    const reservation = this.localStorageApiService.getReservationByRoomId(roomId).find((reservation: { checkIn: moment.MomentInput; }) => moment(reservation.checkIn).isSame(startDay, 'day')); // Your logic to get the reservation
    return reservation ? reservation.numberOfDays : 1;
  }
  
  
}
