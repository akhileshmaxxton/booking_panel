import { Component } from '@angular/core';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private localStorageApiService: LocalStorageService) {
    localStorageApiService.setReservationStatus();
   }

}
