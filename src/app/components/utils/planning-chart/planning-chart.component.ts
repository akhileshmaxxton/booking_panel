import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { LocalStorageService } from '../../../service/localStorageApi/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UniquePipe } from '../../../utils/unique.pipe';
import { FilterService } from '../../../service/filterService/filter.service';
import moment from 'moment';

declare var bootstrap: any;

interface cellDetails {
  roomId: number;
  day: Date;
}

@Component({
  selector: 'app-planning-chart',
  templateUrl: './planning-chart.component.html',
  styleUrls: ['./planning-chart.component.scss'],  // Fixed styleUrls typo
})
export class PlanningChartComponent implements OnInit, AfterViewInit {

  public rooms: RoomAndRoomStayDetails[] = []; 
  public roomsData?: RoomAndRoomStayDetails[];
  public roomDetailsForFilter : RoomAndRoomStayDetails[] = [];
  public viewRoomData : RoomAndRoomStayDetails = {} as RoomAndRoomStayDetails;

  months: { month: Date; days: Date[] }[] = [];
  isMouseDown = false;
  selectedCells: Map<string, cellDetails> = new Map();
  markedData: Set<cellDetails[]> = new Set();
  arrivalDaysForMouseOver: Map<string, cellDetails> = new Map();
  departureDaysForMouseOver: Map<string, cellDetails> = new Map();

  @ViewChild('scrollSentinelNext') scrollSentinelNext?: ElementRef;
  @ViewChild('scrollSentinelPrev') scrollSentinelPrev?: ElementRef;
  observer?: IntersectionObserver;
  options = { rootMargin: '200px', threshold: 0.1 }; 

  private startSelectionDate: Date | null = null;
  private endSelectionDate: Date | null = null;
  private selectionRowId: number | null = null;



  constructor(private roomDetailsApiService: RoomDetailsApiService, private uniquePipe: UniquePipe, private localStorageApiService: LocalStorageService, private router: Router, private route: ActivatedRoute, private filterService: FilterService) {
    this.initCurrentMonth();
  }

  ngOnInit() {
    this.loadMarkedDataFromLocalStorage();
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
        console.log("roomData",this.roomsData);
        this.rooms = this.uniquePipe.transform(this.rooms, 'roomId');
        console.log("roomDetailsForFilter",this.rooms);
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
  loadMarkedDataFromLocalStorage() {
    const reservations = this.localStorageApiService.getAllReservationsFromLocalStorage();
    this.markedData.clear();
    
    reservations.forEach((reservation: { checkIn: Date; numberOfDays: number; roomId: number; }) => {
      const checkInDate = moment(reservation.checkIn).startOf('day');
      const reservationDates: cellDetails[] = [];
  
      for (let i = 0; i < reservation.numberOfDays; i++) {
        const date = checkInDate.clone().add(i, 'days');
        reservationDates.push({ roomId: reservation.roomId, day: date.toDate() });
      }
  
      this.markedData.add(reservationDates);
    });
  }

  isStartOfReservation(roomId: number, day: Date): boolean {
    const currentDay = moment(day).startOf('day');
    const previousDay = currentDay.clone().subtract(1, 'days');
    const isCurrentDayMarked = this.isDateInReservation(currentDay, roomId);
    const isPreviousDayMarked = this.isDateInReservation(previousDay, roomId);
  
    return isCurrentDayMarked && !isPreviousDayMarked;
  }

  isMiddleOfReservation(roomId: number, day: Date): boolean {
    const currentDay = moment(day).startOf('day');  
    return this.isDateInReservation(currentDay, roomId);
  }

  
  isEndOfReservation(roomId: number, day: Date): boolean {
    const currentDay = moment(day).startOf('day');
    const nextDay = currentDay.clone().add(1, 'days');
    const isCurrentDayMarked = this.isDateInReservation(currentDay, roomId);
    const isNextDayMarked = this.isDateInReservation(nextDay, roomId);
  
    return isCurrentDayMarked && (!isNextDayMarked || this.isEndOfMonth(day));
  }

  isDateInReservation(date: moment.Moment, roomId: number): boolean {
    return Array.from(this.markedData).some(reservationDates => 
      reservationDates.some(cell => 
        cell.roomId === roomId && moment(cell.day).isSame(date, 'day')
      )
    )
  }
  //----------DATA HANDLING FOR LOCAL STORAGE - END-----------------

  onMouseOut() {
    this.arrivalDaysForMouseOver.clear();
    this.departureDaysForMouseOver.clear();
  }

  onMouseOver(roomId: number, day: Date, event: MouseEvent) {
    this.arrivalDaysForMouseOver.clear();
    if(this.isDateInReservation(moment(day),roomId)){
      this.getTooltipText(roomId,day);
    }
    
   
    const today = moment().startOf('day');
  
    this.roomsData?.filter(room => room.roomId === roomId)?.forEach(room => {
      const stayDateFrom = moment(room.stayDateFrom);
      const stayDateTo = moment(room.stayDateTo);
    
      for (let date = stayDateFrom; date <= stayDateTo; date = date.add(1, 'days')) {
        if (date.isAfter(today) && room.arrivalDays.includes(date.format('ddd').toUpperCase())) {
          if (!this.isDateInReservation(date, roomId)) {
            const key = `${roomId}_${date.format('YYYY-MM-DD')}`;
            this.arrivalDaysForMouseOver.set(key, { roomId, day: date.toDate() });
          }
        }
      }
    });
    if(this.isDateInReservation(moment(day),roomId) || this.isNotAvailable(roomId, day)) return;
  
    if (this.isMouseDown && roomId === this.selectionRowId) {
      this.endSelectionDate = day;
      this.updateSelection(roomId);
    }
  }
  

  isArrivalCell(roomId: number, day: Date): boolean {
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.arrivalDaysForMouseOver.has(key);
  }

  isDepartureCell(roomId: number, day: Date): boolean {
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.departureDaysForMouseOver.has(key);
  }

  getTooltipText(roomId: number, day: Date): string {
    const booking = this.localStorageApiService.getReservationsById(roomId);
    if(booking){
      return `Booked on ${moment(booking[0].reservationDate).format('DD-MM-YYYY')} \nFrom ${moment(booking[0].checkIn).format('DD-MM-YYYY')} to ${moment(booking[0].checkOut).format('DD-MM-YYYY')} \nFor ${booking[0].numberOfGuests} guests.`;
    }
    return '';
  }
  
  onMouseDown(roomId: number, day: Date, event: MouseEvent) {
    event.preventDefault();
    this.isMouseDown = true;
    this.selectionRowId = roomId; 
    this.startSelectionDate = day;
    this.endSelectionDate = day; 
    if(this.isDateInReservation(moment(day),roomId) || this.isNotAvailable(roomId, day)) return;
    this.updateSelection(roomId);
    this.departureDaysForMouseOver.clear();
  

    this.roomsData?.filter(room => room.roomId === roomId)?.forEach(room => {
        const stayDateFrom = moment(room.stayDateFrom);
        const stayDateTo = moment(room.stayDateTo);
        const selectedDay = moment(day);

        
        if (selectedDay.isBetween(stayDateFrom, stayDateTo, 'days', '[]')) {
            for (let date = selectedDay.clone(); date.isSameOrBefore(stayDateTo); date.add(1, 'days')) {
              if(!this.isDateInReservation(date,roomId)){

                const dayOfWeek = date.format('ddd').toUpperCase();
                
                if (room.departureDays.includes(dayOfWeek)) {
                    const daysFromSelection = date.diff(selectedDay, 'days') + 1; 

                    if (daysFromSelection >= room.minStay && daysFromSelection <= room.maxStay ) {

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
    console.log("departureDaysForMouseOver",this.departureDaysForMouseOver);

    
}

  
  onMouseUp(roomId: number, day: Date, event: MouseEvent) {
    this.isMouseDown = false;
    
    this.startSelectionDate = null;
    this.endSelectionDate = null;
    this.selectionRowId = null;
    this.navigateWithSelectedData();
    this.selectedCells.clear();
    
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
    if (this.isNotAvailable(roomId, day) || this.isStartOfReservation(roomId, day) || this.isEndOfReservation(roomId, day) || this.isMiddleOfReservation(roomId, day)) return false;
    
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.selectedCells.has(key);
  }
  
  
isEndOfMonth(day: Date): boolean {
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);
  return nextDay.getDate() === 1;
}


navigateWithSelectedData() {
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

isNotAvailable(roomId: number, day: Date): boolean {
  const roomDatasets = this.roomsData?.filter(room => room.roomId === roomId) ?? [];

  if (roomDatasets.length === 0) return true; 

  day.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (day < today) {
    return true;
  }

  for (const room of roomDatasets) {
    const stayFrom = new Date(room.stayDateFrom);
    const stayTo = new Date(room.stayDateTo);
    stayFrom.setHours(0, 0, 0, 0);
    stayTo.setHours(0, 0, 0, 0);

    if (day >= stayFrom && day <= stayTo) {
      return false;
    }
  }

  return true;
}
  
}
