import { Component } from '@angular/core';
import { FilterService } from '../../service/filterService/filter.service';

@Component({
  selector: 'app-owner-portal-home',
  templateUrl: './owner-portal-home.component.html',
  styleUrl: './owner-portal-home.component.scss'
})
export class OwnerPortalHomeComponent {

  constructor(private filterService: FilterService) {
    this.filterService.setIsCustomer(false);

   }

}
