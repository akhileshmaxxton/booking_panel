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
import { BookingDetailsFormComponent } from './pages/booking-details-form/booking-details-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerDtailsFormComponent } from './pages/customer-dtails-form/customer-dtails-form.component';
import { PaymentDetailFormComponent } from './pages/payment-detail-form/payment-detail-form.component';
import { RoomViewModelComponent } from './components/utils/room-view-model/room-view-model.component';
import { LocalStorageService } from './service/localStorageApi/local-storage.service';
import { OwnerPortalHomeComponent } from './pages/owner-portal-home/owner-portal-home.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { PlanningChartComponent } from './components/utils/planning-chart/planning-chart.component';
import { CalenderHeaderComponent } from './components/utils/calender-header/calender-header.component';
import { FilterService } from './service/filterService/filter.service';
import { BaseChartDirective } from 'ng2-charts';
import { GoogleChartsModule } from 'angular-google-charts';

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
    ClearFilterButtonComponent,
    BookingDetailsFormComponent,
    CustomerDtailsFormComponent,
    PaymentDetailFormComponent,
    RoomViewModelComponent,
    OwnerPortalHomeComponent,
    BookingPageComponent,
    PlanningChartComponent,
    CalenderHeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    BaseChartDirective,
    GoogleChartsModule
    
  ],
  providers: [RoomDetailsApiService, MergeRoomAndRoomDetails, UniquePipe, LocalStorageService, provideAnimationsAsync(), FilterService],
  bootstrap: [AppComponent]
})
export class AppModule { }
