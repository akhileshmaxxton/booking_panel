import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RoomAndRoomStayDetails } from '../../interface/room-and-room-stay-details';
import { ReservationDetails } from '../../interface/reservation-details';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../service/localStorageApi/local-storage.service';
import { FilterService } from '../../service/filterService/filter.service';
import { RoomDetailsApiService } from '../../service/apiService/room-details-api.service';

@Component({
  selector: 'app-booking-details-form',
  templateUrl: './booking-details-form.component.html',
  styleUrls: ['./booking-details-form.component.scss'],
})
export class BookingDetailsFormComponent {
  public bookingDetails!: FormGroup;
  @Input() roomToBeBooked?: RoomAndRoomStayDetails[];
  @Output() reservationConfirmed = new EventEmitter<ReservationDetails>();
  @Input() reservationDetailsFromParent?: ReservationDetails;
  reservationDetails: ReservationDetails = {
    reservationId: '',
    locationId: 0,
    roomId: 0,
    customerId: '',
    checkIn: new Date(),
    checkOut: new Date(),
    reservationDate: new Date(),
    totalAmount: 0,
    status: '',
    paidAmount: 0,
    numberOfGuests: 0,

    pricePerDayPerPerson: 0,
    numberOfDays: 0,
    paymentIds: [],
  };

  startDate: string | null = null;
  endDate: string | null = null;
  roomId: number | null = null;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private localStorageService: LocalStorageService, private filterService: FilterService, private roomDetailsApiService: RoomDetailsApiService) {
    this.bookingDetails = this.fb.group({
      locationName: [''],
      roomName: [''],
      pricePerDayPerPerson: [''],
      checkIn: ['', [Validators.required, this.checkInDateValidator.bind(this)]],
      checkOut: ['', [Validators.required, this.checkOutDateValidator.bind(this)]],
      numberOfGuests: ['', [Validators.required, Validators.min(1), this.guestValidator.bind(this)]],
      totalAmount: [''],
    });

    if(this.reservationDetailsFromParent?.checkIn && this.reservationDetailsFromParent?.checkOut && this.reservationDetailsFromParent?.numberOfGuests && this.reservationDetailsFromParent?.totalAmount) {
      this.bookingDetails.patchValue({
        checkIn: new Date(this.reservationDetailsFromParent?.checkIn),
        checkOut: new Date(this.reservationDetailsFromParent?.checkOut),
        numberOfGuests: this.reservationDetailsFromParent?.numberOfGuests,
        totalAmount: this.reservationDetailsFromParent?.totalAmount
      })
    }


    console.log('Initial reservationDetails: constructor  ', this.reservationDetails);

    if(!this.filterService.getIsCustomer()){
      this.route.queryParams.subscribe(params => {
        if(params['startDate'] && params['endDate'] && params['roomId']) {
          this.startDate = params['startDate'] || null;
          this.endDate = params['endDate'] || null;
          this.roomId = params['roomId'] || null;

          this.roomDetailsApiService.findRoomByRoomId(parseInt(params['roomId'])).subscribe(data => {
            this.roomToBeBooked = data;
            console.log("roomData", this.roomToBeBooked);
          })
  
          this.bookingDetails.patchValue({
            checkIn: this.startDate ? new Date(this.startDate).toISOString().split('T')[0] : '',
            checkOut: this.endDate ? new Date(this.endDate).toISOString().split('T')[0] : '',
          })
        }
        
        console.log('Start Date:', this.startDate);
        console.log('End Date:', this.endDate);
        console.log('Room ID:', this.roomId);
      });
    }
  }

  ngOnInit() {
    console.log('Initial reservationDetails:', this.reservationDetails);
    if(this.filterService.getIsCustomer()) {
      if (this.roomToBeBooked) {
        console.log("Room to be booked:", this.roomToBeBooked);
        this.bookingDetails.patchValue({
          locationName: this.roomToBeBooked[0]?.locationName,
          roomName: this.roomToBeBooked[0]?.roomName,
          pricePerDayPerPerson: this.roomToBeBooked[0]?.pricePerDayPerPerson,
        });
  
        this.bookingDetails.get('checkIn')?.updateValueAndValidity();
        this.bookingDetails.get('checkOut')?.updateValueAndValidity();
        this.bookingDetails.get('numberOfGuests')?.updateValueAndValidity();
      }
    }

    

  }

  calculateTotalPrice() {
    const checkInDate = new Date(this.bookingDetails?.get('checkIn')?.value) ?? new Date();
    const checkOutDate = new Date(this.bookingDetails?.get('checkOut')?.value ?? new Date());
    const numberOfGuests = this.bookingDetails?.get('numberOfGuests')?.value ?? 0;
  
    // Find the matching room based on the check-in and check-out dates
    const matchingRoom = this.roomToBeBooked?.find(room => {
      const stayFromDate = new Date(room.stayDateFrom);
      const stayToDate = new Date(room.stayDateTo);
      return checkInDate >= stayFromDate && checkOutDate <= stayToDate;
    });
  
    if (matchingRoom) {
      const pricePerDayPerPerson = matchingRoom.pricePerDayPerPerson;
  
      if (checkInDate && checkOutDate && pricePerDayPerPerson && numberOfGuests) {
        const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
        const numberOfDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
  
        this.reservationDetails.numberOfDays = numberOfDays > 0 ? numberOfDays : 0;
  
        const totalPrice = numberOfDays * numberOfGuests * pricePerDayPerPerson;
  
        this.bookingDetails.patchValue({
          totalAmount: totalPrice > 0 ? totalPrice : 0,
        });
      }
    } else {
      console.log("No matching room found for the selected dates.");
      this.bookingDetails.patchValue({
        totalAmount: 0,
      });
    }
  }
  
  checkInDateValidator(control: AbstractControl): ValidationErrors | null {
    const dateValue = moment(control.value);
    const matchingRoom = this.roomToBeBooked?.find(room => {
      const stayFromDate = moment(room.stayDateFrom);
      const stayToDate = moment(room.stayDateTo);
      return dateValue.isBetween(stayFromDate, stayToDate, null, '[]'); // inclusive of boundaries
    });
  
    if (!matchingRoom) {
      return { invalidDate: 'Check-in date does not match any available booking period' };
    }
  
    const arrivalDays: string[] = matchingRoom.arrivalDays.map(day => day.toLowerCase()) ?? [];
    const dateDay = dateValue.format('ddd').toLowerCase();
  
    if (!arrivalDays.includes(dateDay)) {
      return { checkInDateValidation: `Check-in date must be on ${arrivalDays.join(', ')}` };
    }
  
    const storedReservations = this.localStorageService.getReservationsById(matchingRoom.roomId) ?? [];
    const overlappingReservation = storedReservations.find((reservation: ReservationDetails) => {
      return reservation.roomId === matchingRoom.roomId && 
             dateValue.isBetween(moment(reservation.checkIn), moment(reservation.checkOut), null, '[]');
    });
  
    if (overlappingReservation) {
      return { duplicateReservation: 'This check-in date overlaps with an existing reservation for this room.' };
    }
  
    return null;
  }
  
  checkOutDateValidator(control: AbstractControl): ValidationErrors | null {
    const dateValue = moment(control.value);
    const checkInDate = moment(this.bookingDetails?.get('checkIn')?.value);
  
    const matchingRoom = this.roomToBeBooked?.find(room => {
      const stayFromDate = moment(room.stayDateFrom);
      const stayToDate = moment(room.stayDateTo);
      return checkInDate.isBetween(stayFromDate, stayToDate, null, '[]') && dateValue.isBetween(stayFromDate, stayToDate, null, '[]');
    });
  
    if (!matchingRoom) {
      return { invalidDate: 'Check-out date does not match any available booking period' };
    }
  
    const departureDays: string[] = matchingRoom.departureDays.map(day => day.toLowerCase()) ?? [];
    const dateDay = dateValue.format('ddd').toLowerCase();
  
    if (!departureDays.includes(dateDay)) {
      return { checkOutDateValidation: `Check-out date must be on ${departureDays.join(', ')}` };
    }
  
    const numberOfDays = dateValue.diff(checkInDate, 'days') + 1;
  
    if (numberOfDays < matchingRoom.minStay) {
      return { minStay: `Minimum stay is ${matchingRoom.minStay} nights` };
    }
  
    if (numberOfDays > matchingRoom.maxStay) {
      return { maxStay: `Maximum stay is ${matchingRoom.maxStay} nights` };
    }
  
    const storedReservations = this.localStorageService.getReservationsById(matchingRoom.roomId) ?? [];
    const overlappingReservation = storedReservations.find((reservation: ReservationDetails) => {
      return reservation.roomId === matchingRoom.roomId && 
             dateValue.isBetween(moment(reservation.checkIn), moment(reservation.checkOut), null, '[]');
    });
  
    if (overlappingReservation) {
      return { duplicateReservation: 'This check-out date overlaps with an existing reservation for this room.' };
    }
  
    return null;
  }
  
  

  guestValidator(control: AbstractControl): ValidationErrors | null {
    const guests = control.value;
    const checkInDate = new Date(this.bookingDetails?.get('checkIn')?.value);
    const checkOutDate = new Date(this.bookingDetails?.get('checkOut')?.value);
  
    // Find the matching room based on the check-in and check-out dates
    const matchingRoom = this.roomToBeBooked?.find(room => {
      const stayFromDate = new Date(room.stayDateFrom);
      const stayToDate = new Date(room.stayDateTo);
      return checkInDate >= stayFromDate && checkOutDate <= stayToDate;
    });
  
    if (!matchingRoom) {
      return { invalidGuests: 'No matching room found for the selected dates' };
    }
  
    const allowedGuests = matchingRoom.guestCapacity;
  
    if (guests < 1) {
      return { invalidGuests: 'Number of guests must be greater than 0' };
    }
  
    if (allowedGuests && guests > allowedGuests) {
      return { invalidGuests: `Number of guests cannot exceed ${allowedGuests}` };
    }
  
    return null;
  }
  

  goBack() {
    
  }

  
  onSubmit() {
    if (this.bookingDetails.valid) {
      const checkInDate = new Date(this.bookingDetails.get('checkIn')?.value);
      const checkOutDate = new Date(this.bookingDetails.get('checkOut')?.value);
  
      // Find the matching room based on the check-in and check-out dates
      const matchingRoom = this.roomToBeBooked?.find(room => {
        const stayFromDate = new Date(room.stayDateFrom);
        const stayToDate = new Date(room.stayDateTo);
        return checkInDate >= stayFromDate && checkOutDate <= stayToDate;
      });
  
      if (matchingRoom) {
        this.reservationDetails = {
          ...this.reservationDetails,
          reservationId: '',
          locationId: matchingRoom.locationId,
          roomId: matchingRoom.roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          reservationDate: new Date(),
          totalAmount: this.bookingDetails.get('totalAmount')?.value,
          status: 'Pending',
          paidAmount: 0,
          numberOfGuests: this.bookingDetails.get('numberOfGuests')?.value,
          pricePerDayPerPerson: matchingRoom.pricePerDayPerPerson,
          numberOfDays: checkOutDate.getDate() - checkInDate.getDate() + 1,
          paymentIds: [],
        };
  
        this.reservationConfirmed.emit(this.reservationDetails);
      } else {
        console.error("No matching room found for the selected dates.");
        // Handle the case where no matching room is found, possibly by showing an error message to the user.
      }
    }
  }
  
}