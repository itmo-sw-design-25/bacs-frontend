import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/auth.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReservationDto } from '@api/models/reservationDto';
import { ReservationsService } from '@api/services/reservations.service';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { ReservationCardComponent } from '@shared/components/reservation/reservation-card/reservation-card.component';
import { MatButton } from '@angular/material/button';
import { forkJoin, map, switchMap } from 'rxjs';
import { LocationsService } from '@api/services/locations.service';
import { ResourcesService } from '@api/services/resources.service';
import { ReservationFull } from '@core/models/reservation-full';
import { LocationDto } from '@api/models/locationDto';
import { ResourceDto } from '@api/models/resourceDto';

@Component({
  selector: 'app-my-reservations-page',
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    ReactiveFormsModule,
    NgIf,
    ReservationCardComponent,
    NgForOf,
    MatButton
  ],
  templateUrl: './my-reservations-page.component.html',
  styleUrls: ['./my-reservations-page.component.scss'],
  providers: [DatePipe]
})
export class MyReservationsPageComponent implements OnInit {
  currentTab: 'upcoming' | 'past' = 'upcoming';
  displayedReservations: ReservationFull[] = [];

  limitControl = new FormControl(5);
  limitOptions = [5, 10, 20, 50, 100];
  offset = 0;

  userId: string | undefined;

  isLoading = false;
  totalCount = 0;

  private locations: LocationDto[] = [];
  private resources: ResourceDto[] = [];
  private reservations: ReservationFull[] = [];

  constructor(
    private reservationsService: ReservationsService,
    private locationsService: LocationsService,
    private resourcesService: ResourcesService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.userId = this.authService.user?.user_id;
    this.loadReservations(this.limitControl.value!);
  }

  switchTab(tab: 'upcoming' | 'past'): void {
    this.currentTab = tab;
    this.offset = 0;
    this.displayedReservations = [];
    this.loadReservations(this.limitControl.value!);
  }

  changeLimit(newValue: number): void {
    this.offset = 0;
    this.displayedReservations = [];
    this.loadReservations(newValue);
  }

  loadReservations(limit: number): void {
    if (!this.userId) return;

    this.isLoading = true;
    const now = new Date();
    const afterDate = this.currentTab === 'upcoming' ? now.toISOString() : undefined;
    const beforeDate = this.currentTab === 'past' ? now.toISOString() : undefined;

    this.reservationsService.reservationsGet(
      [],
      [this.userId],
      [],
      [],
      [],
      afterDate,
      beforeDate,
      this.offset,
      limit
    ).pipe(
      switchMap(response => {
        const reservations = response.collection ?? [];
        this.totalCount = response.totalCount!;

        const locationIds = Array.from(new Set(reservations.map(r => r.locationId!)));
        const resourceIds = Array.from(new Set(reservations.map(r => r.resourceId!)));

        return forkJoin({
          locations: this.locationsService.locationsGet(locationIds),
          resources: this.resourcesService.resourcesGet(resourceIds)
        }).pipe(
          map(({ locations, resources }) => {
            this.locations = Array.from(new Set([...locations.collection!, ...this.locations]));
            this.resources = Array.from(new Set([...resources.collection!, ...this.resources]));

            const locationMap = new Map(this.locations.map(location => [location.id, location]));
            const resourceMap = new Map(this.resources.map(resource => [resource.id, resource]));

            return reservations.map(reservation => ({
              reservation: reservation,
              location: locationMap.get(reservation.locationId!),
              resource: resourceMap.get(reservation.resourceId!)
            } as ReservationFull));
          })
        );
      })
    ).subscribe((reservations) => {
      this.reservations = [...this.displayedReservations, ...reservations];
      this.displayedReservations = [...this.displayedReservations, ...reservations];
      this.isLoading = false;
    });
  }

  loadMore(): void {
    const limit = this.limitControl.value!;

    this.offset += limit;
    this.loadReservations(limit);
  }

  get hasMore(): boolean {
    return this.displayedReservations.length < this.totalCount;
  }

  onReservationCancelled(reservationId: string): void {
    const updateStatus = (arr: ReservationFull[]) => {
      const index = arr.findIndex(x => x.reservation.id === reservationId);
      if (index === -1) return;

      let reservation = arr[index];
      reservation.reservation.status = 'Cancelled'

      arr[index] = reservation;
    };

    updateStatus(this.reservations);
    updateStatus(this.displayedReservations);
  }

  onReservationCreated(reservation: ReservationDto): void {
    const location = this.locations.find(x => x.id == reservation.locationId);
    const resource = this.resources.find(x => x.id == reservation.resourceId);

    const reservationFull = {
      reservation: reservation,
      location: location,
      resource: resource
    } as ReservationFull;

    this.reservations = [...this.reservations, reservationFull];
    this.displayedReservations = [...this.displayedReservations, reservationFull];
  }

  onReservationUpdated(reservation: ReservationDto): void {
    const location = this.locations.find(x => x.id == reservation.locationId);
    const resource = this.resources.find(x => x.id == reservation.resourceId);

    const reservationFull = {
      reservation: reservation,
      location: location,
      resource: resource
    } as ReservationFull;

    const updateReservation = (arr: ReservationFull[]) => {
      const index = arr.findIndex(x => x.reservation.id === reservation.id);
      if (index === -1) return;

      arr[index] = reservationFull;
    };

    updateReservation(this.reservations);
    updateReservation(this.displayedReservations);
  }
}
