import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { MergeRoomAndRoomDetails } from '../../../utils/merge-room-and-room-details.pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-planning-chart',
  templateUrl: './planning-chart.component.html',
  styleUrls: ['./planning-chart.component.scss'],  // Fixed styleUrls typo
})
export class PlanningChartComponent implements OnInit, AfterViewInit {

  rooms: RoomAndRoomStayDetails[] = []; 

  months: { month: Date; days: Date[] }[] = [];
  isMouseDown = false;
  selectedCells: Set<string> = new Set();
  markedData: Set<string> = new Set();

  @ViewChild('scrollSentinelNext') scrollSentinelNext?: ElementRef;
  @ViewChild('scrollSentinelPrev') scrollSentinelPrev?: ElementRef;
  observer?: IntersectionObserver;
  options = { rootMargin: '0px', threshold: 0.5 };
  private startSelectionDate: Date | null = null;
  private endSelectionDate: Date | null = null;
  private selectionRowId: number | null = null;

  hoveredCell: { roomId: number, day: Date } | null = null;
  hoveredCellDetails: string = '';
  tooltipStyle: any = {};

  constructor( private roomDetailsApiService: RoomDetailsApiService,
    private mergePipe: MergeRoomAndRoomDetails) {
    this.initCurrentMonth();
  }

  ngOnInit() {
    this.loadMarkedDataFromLocalStorage();
    this.fetchData();
  }

  ngAfterViewInit() {
    this.initObservers();
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
    });
  }

  initCurrentMonth() {
    const currentMonth = new Date();
    this.addMonth(currentMonth);
}




  addMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const daysInMonth = this.generateDaysInMonth(date, 1, numDays); // Generate all days
    this.months.push({ month: new Date(year, month), days: daysInMonth });
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
    this.months.unshift({ month: prevMonth, days: this.generateDaysInMonth(prevMonth, 0, numDays) });
  }
  

  generateDaysInMonth(date: Date, startDay: number, endDay: number): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    endDay = Math.min(endDay, numDays);
    return Array.from({ length: endDay - startDay + 1 }, (_, i) => new Date(year, month, startDay + i));
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
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === this.scrollSentinelNext?.nativeElement) {
          this.loadNextMonth();
        } else if (entry.target === this.scrollSentinelPrev?.nativeElement) {
          this.loadPreviousMonth();
        } else {
          // Get the date from the 'data-date' attribute using bracket notation
          const targetDate = (entry.target as HTMLElement).dataset['date'];
  
          if (targetDate) {
            const monthIndex = this.months.findIndex(month =>
              month.days.some(day => day.toDateString() === new Date(targetDate).toDateString())
            );
            if (monthIndex !== -1) {
              this.loadMoreDays(monthIndex);
            }
          }
        }
      }
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

    // Display tooltip details
    this.hoveredCell = { roomId, day };
    this.hoveredCellDetails = this.getCellDetails(roomId, day);
    this.tooltipStyle = {
      left: `${event.clientX}px`,
      top: `${event.clientY}px`,
      display: 'block'
    };
  }

  onMouseOut() {
    // Hide tooltip
    this.hoveredCell = null;
    this.tooltipStyle = { display: 'none' };
  }

  onMouseUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.startSelectionDate = null; // Reset start date
    this.endSelectionDate = null; // Reset end date
    this.selectionRowId = null; // Reset the selected row
  }

  private getCellDetails(roomId: number, day: Date): string {
    if (this.isMarked(roomId, day)) {
      return `Marked - Room: ${roomId}, Date: ${day.toDateString()}`;
    } else if (this.isSelected(roomId, day)) {
      return `Selected - Room: ${roomId}, Date: ${day.toDateString()}`;
    }
    return '';
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

  

  toggleSelection(roomId: number, day: Date) {
    const cellKey = `${roomId}-${day.toISOString().split('T')[0]}`;
    if (this.selectedCells.has(cellKey)) {
      this.selectedCells.delete(cellKey);
    } else {
      this.selectedCells.add(cellKey);
    }
  }

  isSelected(roomId: number, day: Date): boolean {
    return this.selectedCells.has(`${roomId}-${day.toISOString().split('T')[0]}`);
  }

  loadMarkedDataFromLocalStorage() {
    const reservations = JSON.parse(localStorage.getItem('reservation') || '[]');
    this.markedData.clear();
    reservations.forEach((reservation: { checkIn: string | number | Date; numberOfDays: any; roomId: any; }) => {
      const checkInDate = new Date(reservation.checkIn);
      const numDays = reservation.numberOfDays;
      for (let i = 0; i < numDays; i++) {
        const date = new Date(checkInDate);
        date.setDate(checkInDate.getDate() + i);
        this.markedData.add(`${reservation.roomId}-${date.toISOString().split('T')[0]}`);
      }
    });
  }

  isMarked(roomId: number, day: Date): boolean {
    return this.markedData.has(`${roomId}-${day.toISOString().split('T')[0]}`);
  }

  loadMoreDays(monthIndex: number) {
    const currentMonth = this.months[monthIndex];
    const currentDays = currentMonth.days.length;
    const newDays = this.generateDaysInMonth(currentMonth.month, currentDays, currentDays + 7);
    this.months[monthIndex].days.push(...newDays);
}

isHalfStart(roomId: number, day: Date): boolean {
  const cellKey = `${roomId}-${day.toISOString().split('T')[0]}`;
  const previousDay = new Date(day);
  previousDay.setDate(day.getDate() - 1);
  const prevCellKey = `${roomId}-${previousDay.toISOString().split('T')[0]}`;

  return this.markedData.has(cellKey) && (!this.markedData.has(prevCellKey) || this.isStartOfMonth(day));
}

isHalfEnd(roomId: number, day: Date): boolean {
  const cellKey = `${roomId}-${day.toISOString().split('T')[0]}`;
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);
  const nextCellKey = `${roomId}-${nextDay.toISOString().split('T')[0]}`;

  return this.markedData.has(cellKey) && (!this.markedData.has(nextCellKey) || this.isEndOfMonth(day));
}

isStartOfMonth(day: Date): boolean {
  return day.getDate() === 1;
}

isEndOfMonth(day: Date): boolean {
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);
  return nextDay.getDate() === 1;
}
}
