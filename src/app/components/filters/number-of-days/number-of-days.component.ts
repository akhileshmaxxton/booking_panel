import { Component, EventEmitter, Output } from '@angular/core';
import { FilterService } from '../../../service/filterService/filter.service';

@Component({
  selector: 'app-number-of-days',
  templateUrl: './number-of-days.component.html',
  styleUrl: './number-of-days.component.scss'
})
export class NumberOfDaysComponent {
  @Output() priceChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(private filterService: FilterService) {}

  get getNoOfDays(){
    return this.filterService.filters.days;
  }

  onNoOfDaysChangeInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const days = parseFloat(inputElement.value);
    if (!isNaN(days)) {
      this.filterService.setDaysFilter(days);
    }
    if(!days){
      this.filterService.setDaysFilter(null);
    }
  }
}
