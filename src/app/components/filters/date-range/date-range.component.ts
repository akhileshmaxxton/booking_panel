import { Component } from '@angular/core';
import { FilterService } from '../../../service/filterService/filter.service';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrl: './date-range.component.scss'
})
export class DateRangeComponent {

  checkInDate: string | null = null;
  checkOutDate: string | null = null;

  constructor(private filterService: FilterService) {}

  onDateChange() {
    const checkInElement = document.getElementById('checkInDate') as HTMLInputElement;
    const checkOutElement = document.getElementById('checkOutDate') as HTMLInputElement;

    this.checkInDate = checkInElement.value;
    this.checkOutDate = checkOutElement.value;

    if (this.checkInDate && this.checkOutDate) {
      this.filterService.setDateRange(this.checkInDate, this.checkOutDate);
    }
  }
}
