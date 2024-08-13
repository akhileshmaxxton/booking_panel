import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrl: './price.component.scss'
})
export class PriceComponent {
  @Output() priceChanged: EventEmitter<number> = new EventEmitter<number>();

}
