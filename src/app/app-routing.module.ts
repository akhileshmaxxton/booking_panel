import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CustomerPortalHomeComponent } from './pages/customer-portal-home/customer-portal-home.component';
import { BookingDetailsFormComponent } from './pages/booking-details-form/booking-details-form.component';
import { CustomerDtailsFormComponent } from './pages/customer-dtails-form/customer-dtails-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'customer', component: CustomerPortalHomeComponent },
  { path: 'book' , component: BookingDetailsFormComponent},
  // { path: 'customer/book' , component: BookingDetailsFormComponent},
  { path: 'customer-details' , component: CustomerDtailsFormComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
