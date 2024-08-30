import { Component, EventEmitter, Output } from '@angular/core';
import { FilterService } from '../../../service/filterService/filter.service';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrl: './price.component.scss'
})
export class PriceComponent {
  @Output() priceChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(private filterService: FilterService) {}

  get getPrice(){
    return this.filterService.filters.price
  }

  onPriceChangeInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const price = parseFloat(inputElement.value);
    if (!isNaN(price)) {
      this.filterService.setPriceFilter(price);
    }
    if(!price){
      this.filterService.setPriceFilter(null);
    }
  }
}
