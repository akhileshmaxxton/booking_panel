import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { CustomerPortalHomeComponent } from './pages/customer-portal-home/customer-portal-home.component';
import { RoomDetailCardForHomeComponent } from './components/utils/room-detail-card-for-home/room-detail-card-for-home.component';
import { HttpClientModule } from '@angular/common/http';
import { RoomDetailsApiService } from './service/apiService/room-details-api.service';
import { RouterModule } from '@angular/router';
import { MergeRoomAndRoomDetails } from './utils/merge-room-and-room-details.pipe';
import { LocationNameComponent } from './components/filters/location-name/location-name.component';
import { UniquePipe } from './utils/unique.pipe';
import { LogoComponent } from './components/utils/logo/logo.component';
import { DateRangeComponent } from './components/filters/date-range/date-range.component';
import { NumberOfGuestsComponent } from './components/filters/number-of-guests/number-of-guests.component';
import { PriceComponent } from './components/filters/price/price.component';
import { NumberOfDaysComponent } from './components/filters/number-of-days/number-of-days.component';
import { ClearFilterButtonComponent } from './components/filters/clear-filter-button/clear-filter-button.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CustomerPortalHomeComponent,
    RoomDetailCardForHomeComponent,
    LocationNameComponent,
    UniquePipe,
    LogoComponent,
    DateRangeComponent,
    NumberOfGuestsComponent,
    PriceComponent,
    NumberOfDaysComponent,
    ClearFilterButtonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [RoomDetailsApiService, MergeRoomAndRoomDetails,UniquePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
