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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CustomerPortalHomeComponent,
    RoomDetailCardForHomeComponent,
    LocationNameComponent,
    UniquePipe
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
