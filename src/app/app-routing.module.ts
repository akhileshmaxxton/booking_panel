import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CustomerPortalHomeComponent } from './pages/customer-portal-home/customer-portal-home.component';
import { BookingDetailsFormComponent } from './pages/booking-details-form/booking-details-form.component';
import { CustomerDtailsFormComponent } from './pages/customer-dtails-form/customer-dtails-form.component';
import { PaymentDetailFormComponent } from './pages/payment-detail-form/payment-detail-form.component';
import { OwnerPortalHomeComponent } from './pages/owner-portal-home/owner-portal-home.component';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { CalenderHeaderComponent } from './components/utils/calender-header/calender-header.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'customer', component: CustomerPortalHomeComponent },
  { path: 'book' , component: BookingDetailsFormComponent},
  // { path: 'customer/book' , component: BookingDetailsFormComponent},
  { path: 'customer-details' , component: CustomerDtailsFormComponent},
  { path: 'payment-details' , component: PaymentDetailFormComponent},
  { path: 'owner', component: OwnerPortalHomeComponent},
  { path: 'booking', component: BookingPageComponent},
  { path: 'test', component: CalenderHeaderComponent},
  { path: '**', component: ErrorPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
