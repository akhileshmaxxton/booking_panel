import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-number-of-days',
  templateUrl: './number-of-days.component.html',
  styleUrl: './number-of-days.component.scss'
})
export class NumberOfDaysComponent {
  @Output() priceChanged: EventEmitter<number> = new EventEmitter<number>();

  onPriceInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const price = parseFloat(inputElement.value);
    if (!isNaN(price)) {
      this.priceChanged.emit(price);
    }
  }
}
