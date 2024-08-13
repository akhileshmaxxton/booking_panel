import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-number-of-guests',
  templateUrl: './number-of-guests.component.html',
  styleUrl: './number-of-guests.component.scss'
})
export class NumberOfGuestsComponent {
  @Output() guestChanged: EventEmitter<number> = new EventEmitter<number>();

  onGuestChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const guest = parseFloat(inputElement.value);
    if (!isNaN(guest)) {
      this.guestChanged.emit(guest);
    }
  }

}
