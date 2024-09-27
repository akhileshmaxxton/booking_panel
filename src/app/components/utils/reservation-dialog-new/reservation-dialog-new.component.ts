import { ChangeDetectionStrategy, Renderer2, Component, Inject, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import moment from 'moment';
import { LocalStorageService } from '../../../service/localStorageApi/local-storage.service';
import { CustomerDetails } from '../../../interface/customer-details';
import { PaymentDetails } from '../../../interface/payment-details';
import { ReservationDetails } from '../../../interface/reservation-details';
import { MatSnackBar } from '@angular/material/snack-bar';
import ShortUniqueId from 'short-unique-id';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BookingServiceService } from '../../../service/bookingService/booking-service.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-reservation-dialog-new',
  templateUrl: './reservation-dialog-new.component.html',
  styleUrl: './reservation-dialog-new.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ReservationDialogNewComponent {

  maxDate = new Date().toISOString().split('T')[0];
  roomsData: RoomAndRoomStayDetails[] = [];
  selectedArrivalDate: Date | null = null;
  selectedDepartureDate: Date | null = null;
  arrivalDates: Date[] = [];
  departureDates: Date[] = [];
  guestsNumbers: number[] = [];
  selectedGuestsNumber: number = 0;
  selectedRoom: RoomAndRoomStayDetails | null = null;
  roomToBeDisplayed: RoomAndRoomStayDetails[] = [];
  customersForDropDown?: CustomerDetails[] = [];
  dateSelectionGroup!: FormGroup;
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
    paymentIds: []
  }
  customerDetailsFormGroup!: FormGroup;
  customerDetails: CustomerDetails = {
    customerId: '',
    birthData: new Date(),
    firstName: '',
    middleName: '',
    lastName: '',
    country: '',
    state: '',
    city: '',
    pincode: 0,
    phoneNumber: 0,
    reservationIds: [],
  };
  paymentDetailsFormGroup!: FormGroup;
  paymentDetails: PaymentDetails = {
    paymentId: '',
    reservationId: '',
    customerId: '',
    paymentDate: new Date(),
    paymentAmount: 0,
    paymentMode: '',
    paymentDue: 0,
  };
  isSubmitted: boolean = false;
  arrivalDateRooms: RoomAndRoomStayDetails[] = [];
  isEditingRequirements = false;
  
  
  
  private _formBuilder = inject(FormBuilder);

  constructor( public dialogRef: MatDialogRef<ReservationDialogNewComponent>,private roomDetailsApiService: RoomDetailsApiService, private localStorageService: LocalStorageService, private snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: {roomId: number}, private bookingService: BookingServiceService, private router: Router, private renderer: Renderer2) { 
    this.dateSelectionGroup = this._formBuilder.group({
      arrivalDate: ['', [Validators.required,this.arrivalDateValidator.bind(this)]],
      departureDate: ['', [Validators.required, this.departireDateValidator.bind(this)]],
      guests: ['', Validators.required],
    });

    this.customersForDropDown = this.localStorageService.getAllCustomersFromLocalStorage() ?? [];

    this.customerDetailsFormGroup = this._formBuilder.group({
      firstName: ['', [Validators.required, this.nameValidator]],
      middleName: [''],
      lastName: ['', [Validators.required, this.nameValidator]],
      birthDate: ['', [Validators.required, this.birthDateValidator]],
      country: ['', [Validators.required, this.countryValidator]],
      state: ['', [Validators.required, this.stateValidator]],
      city: ['', [Validators.required, this.cityValidator]],
      pincode: ['', [Validators.required, this.pincodeValidator]],
      phoneNumber: ['', [Validators.required, this.phoneNumberValidator]],
    });

    this.paymentDetailsFormGroup = this._formBuilder.group({
      paymentMode: ['', Validators.required],
      paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
      paymentAmount: ['',[ Validators.required]],
    })

    this.paymentDetailsFormGroup.get('paymentAmount')?.valueChanges.subscribe(value => {
      this.paymentAmountValidator(value);
    });
   
  }

  arrivalDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if(!this.isArrivalDateAvailable(value)){
      return { invalidArrivalDate: true };
    }
    return null;
  }

  departireDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if(!this.isDepartureDateAvailable(value)){
      return { invalidDepartureDate: true };
    }
    return null;
  } 

  paymentAmountValidator(value:number): void {
    
    const minAmount = this.reservationDetails.totalAmount * 0.1; // 10% of total amount
    const maxAmount = this.reservationDetails.totalAmount;

    // Reset previous errors
    this.paymentDetailsFormGroup.get('paymentAmount')?.setErrors(null);

    if (value < minAmount) {
      this.paymentDetailsFormGroup.get('paymentAmount')?.setErrors({ minAmount: true });
    } else if (value > maxAmount) {
      this.paymentDetailsFormGroup.get('paymentAmount')?.setErrors({ maxAmount: true });
    }
  }

  ngOnInit() {
    this.bookingService.arrivalDate$.subscribe(date => {
      
      if (date) {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        this.dateSelectionGroup.patchValue({ arrivalDate: formattedDate });
      }
    });

    this.bookingService.departureDate$.subscribe(date => {
      if (date) {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        this.dateSelectionGroup.patchValue({ departureDate: formattedDate });
      }
    });

    if(this.data.roomId){
      this.fetchArrivalDates();
      this.onArrivalDateSelection(this.dateSelectionGroup.get('arrivalDate')?.value);
      this.onDepartureDateSelection(this.dateSelectionGroup.get('departureDate')?.value);
    }
    else{
      this.fetchArrivalDates();
    }
  }
  

  fetchArrivalDates() {
    const bookedReservationFromLocalStorage = this.localStorageService.getAllReservationsFromLocalStorage();
    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {
      
      let arrivalDatesSet: Set<string> = new Set();
      
      (this.data.roomId ? data.filter(room => room.roomId === this.data.roomId) : data ).forEach(room => {
        const bookDateFrom = room?.bookDateFrom ? moment(room.bookDateFrom).startOf('day') : moment(new Date()).startOf('day');
        const bookDateTo = room?.bookDateTo ? moment(room.bookDateTo).startOf('day') : moment(room.stayDateTo).subtract(room.minStay + (room.minDeviation ? room.minDeviation : 0), 'days').startOf('day');
        const stayDateFrom = moment(room.stayDateFrom).startOf('day');
        const stayDateTo = moment(room.stayDateTo).startOf('day');
        const arrivalDays = room?.arrivalDays.map(item => item.toUpperCase());
        const bookedRooomsByRoomId = bookedReservationFromLocalStorage?.filter((reservation: { roomId: number; }) => reservation.roomId === room.roomId);

        if(moment(new Date()).isBetween(bookDateFrom, bookDateTo, 'day', '[]')){

          for(let i = stayDateFrom.clone(); i <= stayDateTo.clone().subtract(room.minStay, 'days'); i = i.add(1, 'days')) {
            let isOverlapping = false;
            bookedRooomsByRoomId.forEach((reservation: { checkIn: Date; checkOut: Date; }) => {
              if(i.isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '()') || i.clone().add(room.minStay, 'days').isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '[]')) {
                isOverlapping = true;
              }
            })
            const isOnArrivalDays = arrivalDays.length > 0 ? arrivalDays.includes(i.format('ddd').toUpperCase()) : true;
            const isValidForMinDeviation = i.isSameOrAfter(moment(new Date()).add(room.minDeviation, 'days').startOf('day'));
            const isValidForMaxDeviation = i.isSameOrBefore(moment(new Date()).add(room.maxDeviation, 'days').startOf('day'));

            if(isOnArrivalDays && isValidForMinDeviation && isValidForMaxDeviation && !isOverlapping) {
              this.arrivalDateRooms.push(room);
              arrivalDatesSet.add(i.format('YYYY-MM-DD'));
            }
          }
        }
      })
      this.arrivalDates = Array.from(arrivalDatesSet).map(dateString => moment(dateString, 'YYYY-MM-DD').toDate());

    })
  }

  isArrivalDateAvailable = (d: Date | null): boolean => {
    if (!d) return false;
    
    const availableDates = this.arrivalDates.map(date => moment(date).startOf('day').format('YYYY-MM-DD'));
    return availableDates.includes(moment(d).startOf('day').format('YYYY-MM-DD'));
  }

  isDepartureDateAvailable = (d: Date | null): boolean => {
    if (!d) {
      return false;
    }
    const availableDates = this.departureDates.map(date => moment(date).startOf('day').format('YYYY-MM-DD'));
    return availableDates.includes(moment(d).startOf('day').format('YYYY-MM-DD'));
  }

  onArrivalDateSelection(selectedDate: Date | null) {
    
    if (!selectedDate) {
      // this.dateSelectionGroup.get('departureDate')?.setValue(null);
      this.dateSelectionGroup.get('guests')?.setValue(null);
      return;
    }

  
    // this.dateSelectionGroup.get('departureDate')?.setValue(null);
    this.dateSelectionGroup.get('guests')?.setValue(null);
    this.departureDates = [];
    this.selectedGuestsNumber = 0;
    this.selectedRoom = null;
    this.selectedArrivalDate = selectedDate;

  let departureDateSet: Set<string> = new Set();

    const arrivalDate = moment(selectedDate).startOf('day');

    const bookedReservationFromLocalStorage = this.localStorageService.getAllReservationsFromLocalStorage();


    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {
      (this.data.roomId ? data.filter(room => room.roomId === this.data.roomId) : data ).forEach(room => {
        const bookDateFrom = room?.bookDateFrom ? moment(room.bookDateFrom).startOf('day') : moment(new Date()).startOf('day');
        const bookDateTo = room?.bookDateTo ? moment(room.bookDateTo).startOf('day') : moment(room.stayDateTo).subtract(room.minStay + (room.minDeviation ? room.minDeviation : 0), 'days').startOf('day');
        const stayDateFrom = moment(room.stayDateFrom).startOf('day');
        const stayDateTo = moment(room.stayDateTo).startOf('day');
        const arrivalDays = room?.arrivalDays.map(item => item.toUpperCase());
        const departureDays = room?.departureDays.map(item => item.toUpperCase());

        const isOnArrivalDays = arrivalDays.length > 0 ? arrivalDays.includes(arrivalDate.format('ddd').toUpperCase()) : true;
        const isBetweenBookFromAndToDate = arrivalDate.isBetween(bookDateFrom, bookDateTo, 'day', '[]');
        const isBetweenStayFromAndToDate = arrivalDate.isBetween(stayDateFrom, stayDateTo, 'day', '[]');
        const isValidForMinDeviation = arrivalDate.isSameOrAfter(moment(new Date()).add(room.minDeviation, 'days').startOf('day'));
        const isValidForMaxDeviation = arrivalDate.isSameOrBefore(moment(new Date()).add(room.maxDeviation, 'days').startOf('day'));
        const bookedRooomsByRoomId = bookedReservationFromLocalStorage?.filter((reservation: { roomId: number; }) => reservation.roomId === room.roomId);


        if(isOnArrivalDays && isBetweenStayFromAndToDate && isBetweenBookFromAndToDate && isValidForMinDeviation && isValidForMaxDeviation) {
          for(let i = arrivalDate.clone(); i <= stayDateTo.clone().subtract(room.minStay, 'days'); i = i.add(1, 'days')) {
            let isOverlapping = false;
            bookedRooomsByRoomId.forEach((reservation: { checkIn: Date; checkOut: Date; }) => {
              if(i.isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '()') || i.clone().add(room.minStay, 'days').isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '[]') || i.clone().add(room.maxStay, 'days').isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '[]')) {
                isOverlapping = true;
              }
            })
            const isValidForMinStay = i.isSameOrAfter(arrivalDate.clone().add(room.minStay, 'days').startOf('day'), 'day');
            const isValidForMaxStay = i.isSameOrBefore(arrivalDate.clone().add(room.maxStay, 'days').startOf('day'), 'day');
            const isOnDepartureDays = (departureDays.length > 0 ? departureDays.includes(i.format('ddd').toUpperCase()) : true);

            if(isValidForMinStay && isValidForMaxStay && isOnDepartureDays && !isOverlapping) {
              departureDateSet.add(i.format('YYYY-MM-DD'));
            }
          }
        }
      })
      this.departureDates = Array.from(departureDateSet).map(dateString => moment(dateString, 'YYYY-MM-DD').toDate());
    })

    this.bookingService.setArrivalDate(selectedDate);

  }


  onDepartureDateSelection(selectedDate: Date | null) {
    if (!selectedDate) return;
    
    this.selectedDepartureDate = selectedDate;
    
      this.selectedGuestsNumber = 0;
      this.selectedRoom = null;


    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {

      const bookedReservationFromLocalStorage = this.localStorageService.getAllReservationsFromLocalStorage();

      (this.data.roomId ? data.filter(room => room.roomId === this.data.roomId) : data ).forEach(room => {
        const arrivalDay = moment(this.selectedArrivalDate).startOf('day');
        const departureDay = moment(selectedDate).startOf('day');
        const stayDateFrom = moment(room.stayDateFrom).startOf('day');
        const stayDateTo = moment(room.stayDateTo).startOf('day');
        const bookDateFrom = room?.bookDateFrom ? moment(room.bookDateFrom).startOf('day') : moment(new Date()).startOf('day');
        const bookDateTo = room?.bookDateTo ? moment(room.bookDateTo).startOf('day') : moment(room.stayDateTo).subtract(room.minStay + (room.minDeviation ? room.minDeviation : 0), 'days').startOf('day');
        const arrivalDays = room?.arrivalDays.map(item => item.toUpperCase());
        const departureDays = room?.departureDays.map(item => item.toUpperCase());

        const isOnArrivalDay = arrivalDays.length > 0 ? arrivalDays.includes(arrivalDay.format('ddd').toUpperCase()) : true;
        const isOnDepartureDay = departureDays.length > 0 ? departureDays.includes(departureDay.format('ddd').toUpperCase()) : true;
        const isBetweenBookFromAndToDate = moment(new Date()).isBetween(bookDateFrom, bookDateTo, 'day', '[]');
        const isBetweenStayFromAndToDate = arrivalDay.isBetween(stayDateFrom, stayDateTo, 'day', '[]');
        const isMinDaviationValid = arrivalDay.isSameOrAfter(moment(new Date()).add(room.minDeviation, 'days').startOf('day'));
        const isMaxDaviationValid = arrivalDay.isSameOrBefore(moment(new Date()).add(room.maxDeviation, 'days').startOf('day'));
        const bookedRoomsByRoomId = bookedReservationFromLocalStorage?.filter((reservation: { roomId: number; }) => reservation.roomId === room.roomId);
        let isOverlapping = false;
        
        bookedRoomsByRoomId.forEach((reservation: { checkIn: Date; checkOut: Date }) => {
          if(arrivalDay.isBetween(moment(reservation.checkIn),moment(reservation.checkOut),'day','()') || departureDay.isBetween(moment(reservation.checkIn),moment(reservation.checkOut),'day','[]') ){
            isOverlapping = true;
          }
        })
        if(isOnArrivalDay && isOnDepartureDay && isBetweenBookFromAndToDate && isMinDaviationValid && isMaxDaviationValid && !isOverlapping) {
          this.roomsData.push(room);
        }
      })
      if(this.selectedArrivalDate && this.selectedDepartureDate && this.roomsData.length > 0){
        this.guestsNumbers = [];
        const maxGuest = Math.max(...this.roomsData.map(room => room.guestCapacity));
        for (let i = 1; i <= maxGuest; i++) {
          this.guestsNumbers.push(i);
        }
      }
    })

    this.bookingService.setDepartureDate(selectedDate);
    this.isEditingRequirements = false;
  }

  onGuestSelection(guests: number) {
    this.selectedGuestsNumber = guests;  
    this.roomToBeDisplayed = this.roomsData.filter(room => room.guestCapacity >= guests);
    this.isEditingRequirements = false;
  }

  selectRoom(room: RoomAndRoomStayDetails) {
    this.selectedRoom = room;

    const arrivalDate = moment(this.selectedArrivalDate)?.hours(11) ?? moment();
    const departureDate = moment(this.selectedDepartureDate)?.hours(10) ?? moment();
    const numberOfGuests = this.dateSelectionGroup?.get('guests')?.value ?? 0;
    const pricePerDayPerPerson = room.pricePerDayPerPerson;

    if (arrivalDate && departureDate && numberOfGuests && pricePerDayPerPerson) {
      const numberOfDays = Math.ceil(departureDate.diff(arrivalDate, 'hours') / 24);
      this.reservationDetails.numberOfDays = numberOfDays > 0 ? numberOfDays : 0;
      const totalPrice = numberOfDays * numberOfGuests * (pricePerDayPerPerson ?? 0);
      this.reservationDetails.totalAmount = totalPrice > 0 ? totalPrice : 0;
      this.paymentDetailsFormGroup.patchValue({
          paymentAmount: totalPrice > 0 ? totalPrice : 0,
      });
    } else {
        console.log("No matching room found for the selected dates.");
        this.paymentDetailsFormGroup.patchValue({
            paymentAmount: 0,
        });
    }

    this.reservationDetails = {
      ...this.reservationDetails,
      locationId: room.locationId,
      roomId: room.roomId,
      customerId: '',
      checkIn: arrivalDate.toDate(),
      checkOut: departureDate.toDate(),
      reservationDate: moment().toDate(),
      totalAmount: this.reservationDetails.totalAmount,
      status: 'Confirmed',
      paidAmount: 0,
      numberOfGuests: numberOfGuests,
      pricePerDayPerPerson: pricePerDayPerPerson,
      numberOfDays: this.reservationDetails.numberOfDays,
      paymentIds: []
    }
    console.log("Reservation Details: ", this.reservationDetails);
  }
  editRequirements() {
    this.isEditingRequirements = true;
  }

  calculateTotalPrice(room: RoomAndRoomStayDetails): number {
    const numberOfGuests = this.dateSelectionGroup?.get('guests')?.value ?? 0;
    const arrivalDate = moment(this.selectedArrivalDate)?.hours(11) ?? moment();
    const departureDate = moment(this.selectedDepartureDate)?.hours(10) ?? moment();
    const numberOfDays = Math.ceil(departureDate.diff(arrivalDate, 'hours') / 24);
    const pricePerDayPerPerson = room.pricePerDayPerPerson;

    return numberOfGuests*pricePerDayPerPerson*numberOfDays;
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidName: 'Name is required' } : null;
  }

  birthDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidBirthDate: 'Birth Date is required' } : null;
  }

  pincodeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const isValid = /^\d{6}$/.test(value);
    return !isValid ? { invalidPincode: 'Pincode must be a 6-digit number' } : null;
  }

  countryValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidCountry: 'Country is required' } : null;
  }

  cityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidCity: 'City is required' } : null;
  }

  stateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return !value ? { invalidState: 'State is required' } : null;
  }

  phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const isValid = /^\d{10}$/.test(value);
    return !isValid ? { invalidPhoneNumber: 'Phone Number must be a 10-digit number' } : null;
  }

  onCustomerSelect(customerId: string) {
    const customer = this.customersForDropDown?.find(customer => customer.customerId === customerId);
    if(customer) {
      this.customerDetails = customer;
      this.customerDetailsFormGroup.patchValue({
        firstName: customer.firstName,
        middleName: customer.middleName ?? '',
        lastName: customer.lastName,
        birthDate:  new Date(customer.birthData).toISOString().split('T')[0],
        country: customer.country,
        state: customer.state,
        city: customer.city,
        pincode: customer.pincode,
        phoneNumber: customer.phoneNumber,
      });

      this.customerDetails = customer;
    }
    else{
      this.customerDetails = {
        customerId: '',
        birthData: new Date(),
        firstName: '',
        middleName: '',
        lastName: '',
        country: '',
        state: '',
        city: '',
        pincode: 0,
        phoneNumber: 0,
        reservationIds: [],
      };
      this.customerDetailsFormGroup.reset();
    }
  }

 


 

  onCustomerFormSubmit() {
    if(this.customerDetailsFormGroup.valid) {
      if(this.customerDetails?.customerId) {
        return;
      }else{
        this.customerDetails = {
          ...this.customerDetails,
          customerId : '',
          birthData : new Date(this.customerDetailsFormGroup?.get('birthDate')?.value),
          firstName : this.customerDetailsFormGroup?.get('firstName')?.value,
          middleName : this.customerDetailsFormGroup?.get('middleName')?.value,
          lastName : this.customerDetailsFormGroup?.get('lastName')?.value,
          country : this.customerDetailsFormGroup?.get('country')?.value,
          state : this.customerDetailsFormGroup?.get('state')?.value,
          city : this.customerDetailsFormGroup?.get('city')?.value,
          pincode : this.customerDetailsFormGroup?.get('pincode')?.value,
          phoneNumber : this.customerDetailsFormGroup?.get('phoneNumber')?.value,
          reservationIds: [],
        }
      }
    }
  }

  submit() {
    if(!this.dateSelectionGroup.valid || !this.customerDetailsFormGroup.valid || !this.paymentDetailsFormGroup)  {
      this.snackBar.open("Need to fill all the details", "close", {
        duration: 3000,
        verticalPosition: 'top',
      });
      return;
    }

    const uid = new ShortUniqueId({ length: 10 });
    const generatedReservationId = uid.rnd();
    const generatedCustomerId = this.customerDetails?.customerId ? this.customerDetails?.customerId : uid.rnd();
    const generatedPaymentId = uid.rnd();

    this.reservationDetails = {
      ...this.reservationDetails,
      reservationId : generatedReservationId,
      customerId: generatedCustomerId,
      paymentIds: [...(this.reservationDetails.paymentIds || []), generatedPaymentId]
    }

    this.customerDetails = {
      ...this.customerDetails,
      customerId: generatedCustomerId,
      reservationIds: [...(this.customerDetails.reservationIds || []), generatedReservationId]
    }

    this.paymentDetails = {
      ...this.paymentDetails,
      paymentId: generatedPaymentId,
        reservationId: generatedReservationId,
        customerId: generatedCustomerId,
        paymentDate: new Date(this.paymentDetailsFormGroup.get('paymentDate')?.value),
        paymentAmount: this.paymentDetailsFormGroup.get('paymentAmount')?.value,
        paymentMode: this.paymentDetailsFormGroup.get('paymentMode')?.value,
        paymentDue: this.reservationDetails?.totalAmount - this.paymentDetailsFormGroup.get('paymentAmount')?.value
    }

    this.localStorageService.setLocalStorage(this.customerDetails, this.reservationDetails, this.paymentDetails);
    this.isSubmitted = true;
    console.log("reservationDetails",this.reservationDetails,"customerDetails",this.customerDetails,"paymentDetails",this.paymentDetails)
  }
  
  showArrival(){
    console.log("arrrrrr",this.arrivalDates);
    console.log("departuuuuuuuuuuuu",this.departureDates);
    console.log("selectedArrivalDate",this.selectedArrivalDate);
    console.log("selectedDepartureDate",this.selectedDepartureDate);
    console.log("roomData",this.roomsData);
    console.log("selectedRoom",this.selectedRoom);
    console.log("arrivalDateRooms",this.arrivalDateRooms)
  }

  printInvoice(): void {
    const data = document.getElementById('booking-preview');
    const downloadButton = document.querySelector('.btn-outline-primary') as HTMLElement;
  
    if (data) {
      if (downloadButton) {
        downloadButton.style.display = 'none';
      }
  
      html2canvas(data, { scale: 2 }).then((canvas) => {
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight; 
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;
  
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
  
        pdf.save('Booking_Invoice.pdf');
        if (downloadButton) {
          downloadButton.style.display = 'block';
        }
      }).catch(err => {
        console.error('Error generating PDF:', err);
        if (downloadButton) {
          downloadButton.style.display = 'block';
        }
      });
    } else {
      console.error('Element not found for printing.');
    }
  }
  
  
  

  close() {
    this.dialogRef.close();
    this.bookingService.setArrivalDate(null);
    this.bookingService.setDepartureDate(null);

    if(this.isSubmitted){
      console.log("navigate to owner")
      window.location.reload();
    }
    const backdrops = document.querySelectorAll('.modal-backdrop.show');
    backdrops.forEach((backdrop) => {
      this.renderer.setStyle(backdrop, 'opacity', '0');
    });
  }

  ngOnDestroy() {
    // Cleanup logic here
    console.log('CustomerDetailsComponent destroyed');
    const backdrops = document.querySelectorAll('.modal-backdrop.show');
    backdrops.forEach((backdrop) => {
      this.renderer.setStyle(backdrop, 'opacity', '0');
    });
  }
}
