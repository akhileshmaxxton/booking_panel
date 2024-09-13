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
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { PlanningChartComponent } from './components/utils/planning-chart/planning-chart.component';
import { CalenderHeaderComponent } from './components/utils/calender-header/calender-header.component';
import { FilterService } from './service/filterService/filter.service';
import { BaseChartDirective } from 'ng2-charts';
import { GoogleChartsModule } from 'angular-google-charts';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableForOwnerPortalComponent } from './components/utils/table-for-owner-portal/table-for-owner-portal.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationDialogNewComponent } from './components/utils/reservation-dialog-new/reservation-dialog-new.component';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSelectModule} from '@angular/material/select';

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
    ErrorPageComponent,
    TableForOwnerPortalComponent,
    ReservationDialogNewComponent,
    
    
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
    GoogleChartsModule,
    ScrollingModule,
    TooltipModule.forRoot(),
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatGridListModule,
    MatSelectModule
  ],
  providers: [RoomDetailsApiService, MergeRoomAndRoomDetails, UniquePipe, LocalStorageService, provideAnimationsAsync(), FilterService, {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}, {provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true},}, provideNativeDateAdapter()],
  bootstrap: [AppComponent]
})
export class AppModule { }
