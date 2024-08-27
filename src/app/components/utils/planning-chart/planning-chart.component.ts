import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { MergeRoomAndRoomDetails } from '../../../utils/merge-room-and-room-details.pipe';
import { forkJoin } from 'rxjs';
import { LocalStorageService } from '../../../service/localStorageApi/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UniquePipe } from '../../../utils/unique.pipe';

@Component({
  selector: 'app-planning-chart',
  templateUrl: './planning-chart.component.html',
  styleUrls: ['./planning-chart.component.scss'],  // Fixed styleUrls typo
})
export class PlanningChartComponent implements OnInit, AfterViewInit {

  rooms: RoomAndRoomStayDetails[] = []; 
  roomData?: RoomAndRoomStayDetails[];

  months: { month: Date; days: Date[] }[] = [];
  isMouseDown = false;
  selectedCells: Set<string> = new Set();
  markedData: Set<string[]> = new Set();

  @ViewChild('scrollSentinelNext') scrollSentinelNext?: ElementRef;
  @ViewChild('scrollSentinelPrev') scrollSentinelPrev?: ElementRef;

  observer?: IntersectionObserver;
  options = { rootMargin: '200px', threshold: 0.1 }; // Increased rootMargin for earlier detection

  private startSelectionDate: Date | null = null;
  private endSelectionDate: Date | null = null;
  private selectionRowId: number | null = null;

  hoveredCell: { roomId: number, day: Date } | null = null;
  hoveredCellDetails: string = '';
  tooltipStyle: any = {};

  constructor(
    private roomDetailsApiService: RoomDetailsApiService,
    private mergePipe: MergeRoomAndRoomDetails,
    private uniquePipe: UniquePipe,
    private localStorageApiService: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initCurrentMonth();
  }

  ngOnInit() {
    this.loadMarkedDataFromLocalStorage();
    this.fetchData();
  }

  ngAfterViewInit() {
    this.initObservers();
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
      setTimeout(() => this.loadNextMonth(), 300); // Add a delay for smoothness
    } else if (shouldLoadPreviousMonth && !shouldLoadNextMonth) {
      setTimeout(() => this.loadPreviousMonth(), 300); // Add a delay for smoothness
    }
  }

  initCurrentMonth() {
    const currentMonth = new Date();
    this.months = []; // Clear any existing months
    this.addMonth(currentMonth);
  }

  addMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const daysInMonth = this.generateDaysInMonth(date, 1, numDays);
    this.months.push({ month: new Date(year, month), days: daysInMonth });


    // Trigger a reflow for smooth loading effect
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

  fetchData() {
    forkJoin({
      roomStayDetails: this.roomDetailsApiService.getRoomStayDetails(),
      roomDetails: this.roomDetailsApiService.getRoomDetails(),
    }).subscribe(({ roomStayDetails, roomDetails }) => {
      this.rooms = this.mergePipe.transform(
        roomStayDetails,
        roomDetails
      );
      this.rooms = this.uniquePipe.transform(this.rooms, 'roomId');
    });
  }

  onMouseDown(roomId: number, day: Date, event: MouseEvent) {
    event.preventDefault();
    this.isMouseDown = true;
    this.selectionRowId = roomId; // Store the current row (roomId) being selected
    this.startSelectionDate = day; // Record the start date of the selection
    this.endSelectionDate = day; // Initialize end date to start date
    this.updateSelection();
  }

  onMouseOver(roomId: number, day: Date, event: MouseEvent) {
    if (this.isMouseDown && roomId === this.selectionRowId) {
      this.endSelectionDate = day;
      this.updateSelection();
    }

    
  }

  onMouseOut() {
    // Hide tooltip
  }

  onMouseUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.startSelectionDate = null;
    this.endSelectionDate = null;
    this.selectionRowId = null;
  }

  private updateSelection() {
    if (this.startSelectionDate && this.endSelectionDate && this.selectionRowId) {
      // Clear previous selection
      this.selectedCells.clear();
      
      // Determine the range of days
      const startDate = this.startSelectionDate;
      const endDate = this.endSelectionDate;
      // Loop through all months and days to select the range within the specified row
      this.months.forEach(month => {
        month.days.forEach(day => {
          if (day >= startDate && day <= endDate) {
            this.selectedCells.add(`${this.selectionRowId}-${day.toISOString().split('T')[0]}`);
          }
        });
      });
    }
  }

  isSelected(roomId: number, day: Date): boolean {
    return this.selectedCells.has(`${roomId}-${day.toISOString().split('T')[0]}`);
  }

  loadMarkedDataFromLocalStorage() {
    const reservations = this.localStorageApiService.getAllReservationsFromLocalStorage();
    this.markedData.clear();
    
    reservations.forEach((reservation: { checkIn: Date; numberOfDays: number; roomId: number; }) => {
      const checkInDate = new Date(reservation.checkIn);
      const reservationDates: string[] = [];
      checkInDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < reservation.numberOfDays; i++) {
        const date = new Date(checkInDate);
        date.setDate(checkInDate.getDate() + i);
        reservationDates.push(`${reservation.roomId}-${date.toISOString().split('T')[0]}`);
      }
  
      // Add this reservation's dates to the marked data as a new array
      this.markedData.add(reservationDates);
    });
  }

  isMiddleOfReservation(roomId: number, day: Date): boolean {
    const cellKey = `${roomId}-${day.toISOString().split('T')[0]}`;
    return Array.from(this.markedData).some(reservationDates => reservationDates.includes(cellKey));
  }

  isStartOfReservation(roomId: number, day: Date): boolean {
    const cellKey = `${roomId}-${day.toISOString().split('T')[0]}`;
    const previousDay = new Date(day);
    previousDay.setDate(day.getDate() - 1);
    const prevCellKey = `${roomId}-${previousDay.toISOString().split('T')[0]}`;

    if(Array.from(this.markedData).some(reservationDates => 
      reservationDates.includes(cellKey) && 
      (!reservationDates.includes(prevCellKey) || this.isStartOfMonth(day))
    )){
    }
    return Array.from(this.markedData).some(reservationDates => 
      reservationDates.includes(cellKey) && 
      (!reservationDates.includes(prevCellKey) || this.isStartOfMonth(day))
    );
  }

isEndOfReservation(roomId: number, day: Date): boolean {
  const cellKey = `${roomId}-${day.toISOString().split('T')[0]}`;
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);
  const nextCellKey = `${roomId}-${nextDay.toISOString().split('T')[0]}`;

  return Array.from(this.markedData).some(reservationDates => 
    reservationDates.includes(cellKey) && 
    (!reservationDates.includes(nextCellKey) || this.isEndOfMonth(day))
  );
}

isStartOfMonth(day: Date): boolean {
  return day.getDate() === 1;
}

isEndOfMonth(day: Date): boolean {
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);
  return nextDay.getDate() === 1;
}

navigateWithSelectedData() {
  if (this.selectedCells.size > 0) {
    const selectedArray = Array.from(this.selectedCells);

    const startCell = selectedArray[0];
    const endCell = selectedArray[selectedArray.length - 1];

    const [startRoomId, startDateStr] = startCell.split('-');
    const [endRoomId, endDateStr] = endCell.split('-');

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    
    
    this.router.navigate(['/booking'], {
      relativeTo: this.route,
      queryParams: {
        startDate: startDate.toISOString(),  
        endDate: endDate.toISOString(),    
        roomId: startRoomId 
      }
    });
   
  } else {
    console.error('No cells selected.');
  }
}
}
