import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CalendarView } from 'angular-calendar';

@Component({
  selector: 'app-calender-header',
  templateUrl: './calender-header.component.html',
  styleUrl: './calender-header.component.scss'
})
export class CalenderHeaderComponent {
  @Input() view!: CalendarView;

  @Input() viewDate!: Date;

  @Input() locale: string = 'en';

  @Output() viewChange = new EventEmitter<CalendarView>();

  @Output() viewDateChange = new EventEmitter<Date>();

  CalendarView = CalendarView;

  // This method is called when a view change button is clicked
  onViewChange(view: CalendarView) {
    this.viewChange.emit(view);
  }

  // This method is called when the view date is changed
  onViewDateChange(date: Date) {
    this.viewDateChange.emit(date);
  }
}
