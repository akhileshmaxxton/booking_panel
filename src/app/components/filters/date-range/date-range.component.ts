import { Component } from '@angular/core';
import { FilterService } from '../../../service/filterService/filter.service';
import moment from 'moment';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrl: './date-range.component.scss'
})
export class DateRangeComponent {

  checkInDate: string | null = null;
  checkOutDate: string | null = null;
  minDate = new Date().toISOString().split('T')[0];
  public selectedDateRange: string = '';

  constructor(private filterService: FilterService) {}

  onDateChange() {
    const checkInElement = document.getElementById('checkInDate') as HTMLInputElement;
    const checkOutElement = document.getElementById('checkOutDate') as HTMLInputElement;

    this.checkInDate = checkInElement.value;
    this.checkOutDate = checkOutElement.value;
    console.log("checkIn data type", typeof this.checkInDate)

    if (this.checkInDate && this.checkOutDate) {
      this.filterService.setDateRange(moment(this.checkInDate).toDate(), moment(this.checkOutDate).toDate());
      this.selectedDateRange = `${moment(this.checkInDate).format('MM/DD/YYYY')} - ${moment(this.checkOutDate).format('MM/DD/YYYY')}`;
    }
  }
}
