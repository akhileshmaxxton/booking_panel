import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { RoomAndRoomStayDetails } from '../../../interface/room-and-room-stay-details';
import { RoomDetailsApiService } from '../../../service/apiService/room-details-api.service';
import { LocalStorageService } from '../../../service/localStorageApi/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UniquePipe } from '../../../utils/unique.pipe';
import { FilterService } from '../../../service/filterService/filter.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ReservationDialogNewComponent } from '../reservation-dialog-new/reservation-dialog-new.component';
import { BookingServiceService } from '../../../service/bookingService/booking-service.service';

declare var bootstrap: any;

interface cellDetails {
  roomId: number;
  day: Date;
}

@Component({
  selector: 'app-planning-chart',
  templateUrl: './planning-chart.component.html',
  styleUrl: './planning-chart.component.scss',
})
export class PlanningChartComponent implements OnInit, AfterViewInit {

  public rooms: RoomAndRoomStayDetails[] = []; 
  public roomsData?: RoomAndRoomStayDetails[];
  public roomDetailsForFilter : RoomAndRoomStayDetails[] = [];
  public viewRoomData : RoomAndRoomStayDetails = {} as RoomAndRoomStayDetails;

  months: { month: Date; days: Date[] }[] = [];
  isMouseDown = false;
  selectedCells: Map<string, cellDetails> = new Map();
  arrivalDaysForMouseOver: Map<string, cellDetails> = new Map();
  departureDaysForMouseOver: Map<string, cellDetails> = new Map();

  @ViewChild('scrollSentinelNext') scrollSentinelNext?: ElementRef;
  @ViewChild('scrollSentinelPrev') scrollSentinelPrev?: ElementRef;
  observer?: IntersectionObserver;
  options = { rootMargin: '200px', threshold: 0.1 }; 

  private startSelectionDate: Date | null = null;
  private endSelectionDate: Date | null = null;
  private selectionRowId: number | null = null;
  selectedDetail: any = null;

  constructor(private roomDetailsApiService: RoomDetailsApiService, private uniquePipe: UniquePipe, private localStorageApiService: LocalStorageService, private router: Router, private route: ActivatedRoute, private filterService: FilterService, private snackBar: MatSnackBar, public dialog: MatDialog, private bookingService: BookingServiceService,private elementRef: ElementRef, private renderer: Renderer2) {
    // localStorageApiService.setReservationStatus();
    this.initCurrentMonth();
  }

  ngOnInit() {
    this.fetchDataAndApplyFilters();
  }

  ngAfterViewInit() {
    this.initObservers();
  }

  private fetchDataAndApplyFilters() {
    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe((mergedData) => {
      this.roomDetailsForFilter = mergedData;
      this.roomsData = mergedData;
      this.rooms = mergedData;
        this.rooms = this.uniquePipe.transform(this.rooms, 'roomId');
    });
  }

  onViewRoom(viewRoomData: RoomAndRoomStayDetails) {
    this.viewRoomData = viewRoomData;
  }

  clearFilter(){
    this.filterService.resetFilters();
  }

  initObservers() {
    this.observer = new IntersectionObserver(this.handleObserver.bind(this), this.options);
    if (this.scrollSentinelNext?.nativeElement) {
      this.observer.observe(this.scrollSentinelNext.nativeElement);
    }
    if (this.scrollSentinelPrev?.nativeElement) {
      this.observer.observe(this.scrollSentinelPrev.nativeElement);
    }
  }

  //----------HANDLES INTERSECTION OBSERVER - START----------
  handleObserver(entries: IntersectionObserverEntry[]) {
    let shouldLoadNextMonth = false;
    let shouldLoadPreviousMonth = false;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target === this.scrollSentinelNext?.nativeElement) {
          shouldLoadNextMonth = true;
        } else if (entry.target === this.scrollSentinelPrev?.nativeElement) {
          shouldLoadPreviousMonth = true;
        }
      }
    });

    if (shouldLoadNextMonth && !shouldLoadPreviousMonth) {
      setTimeout(() => this.loadNextMonth(), 300); 
    } else if (shouldLoadPreviousMonth && !shouldLoadNextMonth) {
      setTimeout(() => this.loadPreviousMonth(), 300);
    }
  }

  initCurrentMonth() {
    const currentMonth = new Date();
    this.months = []; 
    this.addMonth(currentMonth);
  }

  addMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const daysInMonth = this.generateDaysInMonth(date, 1, numDays);
    this.months.push({ month: new Date(year, month), days: daysInMonth });


   
    setTimeout(() => {
      document.querySelector('.booking-chart-container')?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100);
  }

  loadNextMonth() {
    const lastMonth = this.months[this.months.length - 1].month;
    const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);
    this.addMonth(nextMonth);
  }

  loadPreviousMonth() {
    const firstMonth = this.months[0].month;
    const prevMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() - 1, 1);
    const numDays = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
    this.months.unshift({ month: prevMonth, days: this.generateDaysInMonth(prevMonth, 1, numDays) });
  }

  generateDaysInMonth(date: Date, startDay: number, endDay: number): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    endDay = Math.min(endDay, numDays);
    return Array.from({ length: endDay - startDay + 1 }, (_, i) => new Date(year, month, startDay + i));
  }
  //----------HANDLES INTERSECTION OBSERVER - END----------

  //----------DATA HANDLING FOR LOCAL STORAGE - START-----------------
  isStartOfReservation(roomId: number, day: Date): boolean {
    const selectedDay = moment(day);
    const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
    const reservation = reservations.find((reservation: { checkIn: moment.MomentInput; }) => moment(reservation.checkIn).isSame(selectedDay, 'day'));
    return !!reservation;
  }

  isMiddleOfReservation(roomId: number, day: Date): boolean {
    const selectedDay = moment(day);
    const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
    const reservation = reservations.find((reservation: { checkIn: moment.MomentInput; checkOut: moment.MomentInput; }) => selectedDay.isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '()'));
    return !!reservation;
  }

  
  isEndOfReservation(roomId: number, day: Date): boolean {
    const selectedDay = moment(day);
    const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
    const reservation = reservations.find((reservation: { checkOut: moment.MomentInput; }) => moment(reservation.checkOut).isSame(selectedDay, 'day'));
    return !!reservation;
  }

  isDateInReservation(date: moment.Moment, roomId: number): boolean {
    const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
    const reservation = reservations.find((reservation: { checkIn: moment.MomentInput; checkOut: moment.MomentInput; }) => date.isBetween(moment(reservation.checkIn), moment(reservation.checkOut), 'day', '[]'));
    return !!reservation;

  }
  //----------DATA HANDLING FOR LOCAL STORAGE - END-----------------

  //----------EVENT HANDLERS - START-----------------

  onMouseOut() {
    this.arrivalDaysForMouseOver.clear();
  }


  checkReservation(roomId: number, day: Date, event: MouseEvent) {
    let reservation: any;
    let customer: any;
    let payment: any;
  
    if (this.isStartOfReservation(roomId, day)) {
      const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
      reservation = reservations.find((res: { checkIn: Date; }) => moment(res.checkIn).isSame(day, 'day'));
    }
  
    if (this.isMiddleOfReservation(roomId, day)) {
      const reservations = this.localStorageApiService.getReservationByRoomId(roomId);
      reservation = reservations.find((res: { checkIn: Date; checkOut: Date; }) => moment(day).isBetween(moment(res.checkIn), moment(res.checkOut), 'day', '()'));
    }
  
    if (reservation) {
      customer = this.localStorageApiService.getCustomerById(reservation.customerId);
      payment = this.localStorageApiService.getPaymentById(reservation.paymentIds[0]);
      const room = this.roomsData?.find((room: { roomId: number; }) => room.roomId === roomId);
      this.openModalForBookedDetais(reservation, customer, payment, room);
    }
    const backdrops = document.querySelectorAll('.modal-backdrop.show');
    backdrops.forEach((backdrop) => {
      this.renderer.setStyle(backdrop, 'display', 'none',);
    });
  }

  onMouseDown(roomId: number, day: Date, event: MouseEvent) {
    event.preventDefault();
    if (this.isStartOfReservation(roomId, day) || this.isMiddleOfReservation(roomId, day)) {
      return;
    }

    if(this.isNotAvailable(day)) {
      this.openSnackBar('Booking cannot be done in the past.', 'Close');
      return;
    }

    if(!this.isArrivalCell(roomId, day)){
      this.openSnackBar('Please select an valid arrival date highlighted in green.', 'Close');
      return;
    }

    this.isMouseDown = true;
    this.selectionRowId = roomId;
    this.startSelectionDate = day;
    this.endSelectionDate = day;


    this.selectedCells.clear();
    this.updateSelection(roomId);
    this.departureDaysForMouseOver.clear();

    this.findDepartureDates(roomId, day);
    if ( this.isMouseDown) {
      this.arrivalDaysForMouseOver.clear();
    }
  }

  onMouseOver(roomId: number, day: Date, event: MouseEvent) {
    if(!this.isMouseDown) {
      this.arrivalDaysForMouseOver.clear();
      this.findArrivalDates(roomId);
      
      if(this.isDateInReservation(moment(day),roomId)){
        this.getTooltipText(roomId,day);
      }
    }
    if (this.isMouseDown && this.selectionRowId !== null) {
      this.endSelectionDate = day;
      this.updateSelection(this.selectionRowId);
    }
  }
  
  onMouseUp(roomId: number, day: Date, event: MouseEvent) {
    this.isMouseDown = false;

    if(this.selectedCells.size <= 0) {
      this.selectedCells.clear();
      this.departureDaysForMouseOver.clear();
      this.openSnackBar('Booking must be made for at least 1 night', 'Close');
      return;
    }

    if(!this.isDepartureCell(roomId, day)) {
      this.selectedCells.clear();
      this.departureDaysForMouseOver.clear();
      this.openSnackBar('Please select an valid departure date highlighted in yellow.', 'Close');
      return;
    }

    if(this.isEndOfReservation(roomId, day) || this.isMiddleOfReservation(roomId, day)) {
      this.selectedCells.clear();
      this.departureDaysForMouseOver.clear();
      this.openSnackBar('Booking cannot be made on dates that are already reserved.', 'Close');
      return;
    }
    this.bookingService.setArrivalDate(this.startSelectionDate);
    this.bookingService.setDepartureDate(this.endSelectionDate);

    this.openDialog();
  }

  //----------EVENT HANDLERS - END ------------------
  getTooltipText(roomId: number, day: Date): string {
    const reservation = this.localStorageApiService.getReservationByRoomId(roomId).find((reservation: { checkIn: moment.MomentInput; }) => moment(reservation.checkIn).isSame(day, 'day'));
    const customer  = this.localStorageApiService.getAllCustomersFromLocalStorage().find((customer: { customerId: string; }) => customer.customerId === reservation?.customerId);
    if(reservation){
      return `Booked on ${moment(reservation.reservationDate).format('DD-MM-YYYY')} \nFrom ${moment(reservation.checkIn).format('DD-MM-YYYY')} to ${moment(reservation.checkOut).format('DD-MM-YYYY')} \nFor ${customer?.firstName} ${customer?.lastName}.`;
    }
    return '';
  }
  
  updateSelection(roomId: number) {
    this.selectedCells.clear();

    const startDate = moment(this.startSelectionDate);
    const endDate = moment(this.endSelectionDate);

    if (startDate.isSameOrBefore(endDate)) {
      let currentDate = startDate.clone();
      while (currentDate.isSameOrBefore(endDate)) {
        const dateKey = `${roomId}_${currentDate.format('YYYY-MM-DD')}`;
        this.selectedCells.set(dateKey, { roomId, day: currentDate.toDate() });
        currentDate.add(1, 'days');
      }
    }
  }
  
  isSelected(roomId: number, day: Date): boolean {
    // if (this.isNotAvailable(roomId, day) || this.isStartOfReservation(roomId, day) || this.isEndOfReservation(roomId, day) || this.isMiddleOfReservation(roomId, day)) return false;
    
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.selectedCells.has(key);
  }
  
  
  isEndOfMonth(day: Date): boolean {
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    return nextDay.getDate() === 1;
  }


  //-------------------------UTILITIES-----------------------
  isNotAvailable(day: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) {
      return true;
    }
    return false;
  }

  isArrivalCell(roomId: number, day: Date): boolean {
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.arrivalDaysForMouseOver.has(key);
  }

  isDepartureCell(roomId: number, day: Date): boolean {
    const key = `${roomId}_${moment(day).format('YYYY-MM-DD')}`;
    return this.departureDaysForMouseOver.has(key);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'top',
    });
  }


  findArrivalDates(roomId: number){
    const bookedReservationFromLocalStorage = this.localStorageApiService.getAllReservationsFromLocalStorage();
    this.arrivalDaysForMouseOver.clear();

    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {
      (roomId ? data.filter(room => room.roomId === roomId) : data ).filter(room => room.roomId === roomId).forEach(room => {
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
              const key = `${roomId}_${i.format('YYYY-MM-DD')}`;
              this.arrivalDaysForMouseOver.set(key, { roomId, day: i.toDate() });
            }
          }
        }
      })  
    })
  }

  findDepartureDates(roomId: number, day: Date){
    const arrivalDate = moment(day).startOf('day');

    const bookedReservationFromLocalStorage = this.localStorageApiService.getAllReservationsFromLocalStorage();

    this.roomDetailsApiService.fetchAllDataForCustomerPortal().subscribe(data => {
      (roomId ? data.filter(room => room.roomId === roomId) : data ).filter(room => room.roomId === roomId).forEach(room => {
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
              const cellDetail: cellDetails = {
                roomId: room.roomId,
                day: i.toDate(),
              };
              this.departureDaysForMouseOver.set(`${roomId}_${i.format('YYYY-MM-DD')}`, cellDetail);
            }
          }
        }
      })
    })
  }

  getReservationWidthandStatus(roomId: number, startDay: Date) {
    const reservation = this.localStorageApiService.getReservationByRoomId(roomId).find((reservation: { checkIn: moment.MomentInput; }) => moment(reservation.checkIn).isSame(startDay, 'day'));
    const reservationLength = reservation ? reservation.numberOfDays : 1;
    const spanWidth = reservationLength*100 - reservationLength*0.5;
    
    let backgroundColor = '';
    if (reservation) {
      switch (reservation.status) {
        case 'Confirmed':
          backgroundColor = 'coral';
          break;
        case 'Check-In':
          backgroundColor = 'lightgreen';
          break;
        case 'Check-Out':
          backgroundColor = 'lightblue';
          break;
        default:
          backgroundColor = 'gray';
          break;
      }
    }
  
    return {
      width: `${spanWidth}%`,
      backgroundColor: backgroundColor
    };
  }

  getCustomerNameForReservation(roomId: number, startDay: Date) {
    const reservation = this.localStorageApiService.getReservationByRoomId(roomId).find((reservation: { checkIn: moment.MomentInput; }) => moment(reservation.checkIn).isSame(startDay, 'day'));
    const customer  = this.localStorageApiService.getAllCustomersFromLocalStorage().find((customer: { customerId: string; }) => customer.customerId === reservation?.customerId);
    return `${customer?.firstName} ${customer?.lastName}`;
  }
  
  openDialog() {
    const dialogRef = this.dialog.open(ReservationDialogNewComponent, {data: { roomId: this.selectionRowId }, panelClass: 'my-outlined-dialog'});

    dialogRef.afterClosed().subscribe(result => {
      this.bookingService.setArrivalDate(null);
      this.bookingService.setDepartureDate(null);
      this.selectedCells.clear();
      this.departureDaysForMouseOver.clear();
      this.arrivalDaysForMouseOver.clear();
    });
  }

  openModalForBookedDetais(reservation: any, customer: any, payment: any, room: any) {
    this.selectedDetail = {reservation, customer, payment, room};
    console.log(this.selectedDetail);
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
  }


  updateStatus(event: any, detail: any) {
    const resservations = this.localStorageApiService.getAllReservationsFromLocalStorage()
    const reservationIndex = resservations.findIndex((res: { reservationId: any; }) => res.reservationId === detail.reservation.reservationId);
    console.log("reservationIndex", reservationIndex);
    if (reservationIndex !== -1) {
      resservations[reservationIndex].status = event.target.value;
    }
    this.localStorageApiService.setReservations(resservations);
  }
}
