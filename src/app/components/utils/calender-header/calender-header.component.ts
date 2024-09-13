import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import moment from 'moment';



@Component({
  selector: 'app-calender-header',
  templateUrl: './calender-header.component.html',
  styleUrls: ['./calender-header.component.scss'] // Corrected 'styleUrl' to 'styleUrls'
})
export class CalenderHeaderComponent  implements OnInit{
  isCalendarVisible = false;
  selectedDate: string = '';
  currentYear: number;
  currentMonth: number;
  daysInMonth: (number | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = moment.months(); // Array of month names

  constructor() {
    const today = moment();
    this.currentYear = today.year();
    this.currentMonth = today.month();
  }

  ngOnInit() {
    this.generateCalendar();
  }

  toggleCalendar() {
    this.isCalendarVisible = !this.isCalendarVisible;
  }

  generateCalendar() {
    const startOfMonth = moment([this.currentYear, this.currentMonth]).startOf('month');
    const endOfMonth = moment([this.currentYear, this.currentMonth]).endOf('month');

    const daysInPrevMonth = startOfMonth.day(); // Days from previous month to fill grid
    const totalDays = endOfMonth.date(); // Total days in the current month

    this.daysInMonth = [];

    // Fill in days from the previous month
    for (let i = 0; i < daysInPrevMonth; i++) {
      this.daysInMonth.push(null);
    }

    // Fill in the days of the current month
    for (let day = 1; day <= totalDays; day++) {
      this.daysInMonth.push(day);
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  onDateSelect(day: number | null) {
    if (day) {
      this.selectedDate = moment([this.currentYear, this.currentMonth, day]).format('YYYY-MM-DD');
      this.isCalendarVisible = false;
    }
  }

  isSelected(day: number | null): boolean {
    return day
      ? this.selectedDate === moment([this.currentYear, this.currentMonth, day]).format('YYYY-MM-DD')
      : false;
  }
}
