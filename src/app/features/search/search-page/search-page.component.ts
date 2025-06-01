import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { ActivatedRoute } from '@angular/router';
import { ReservationsService } from '@api/services/reservations.service';
import { startOfDay, startOfNextDay } from '@shared/utils/date.utils';
import { ReservationStatus } from '@api/models/reservationStatus';
import { ResourcesService } from '@api/services/resources.service';
import { map, switchMap, tap } from 'rxjs';
import { ResourceDto } from '@api/models/resourceDto';
import { ResourceSlots, Slot } from '@core/models/resource-slots';
import { SearchResultsComponent } from '@features/search/search-results/search-results.component';
import { LocationDto } from '@api/models/locationDto';
import { LocationsService } from '@api/services/locations.service';
import { ResourceType } from '@api/models/resourceType';
import { ResourceTypePipe } from '@shared/pipes/resource-type.pipe';
import { ReservationDto } from '@api/models/reservationDto';

@Component({
  selector: 'bacs-search-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    SearchResultsComponent,
    ResourceTypePipe
  ],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  readonly minReservationTime = 30;

  dateControl = new FormControl(new Date());
  resourceTypeControl = new FormControl();

  resourceTypes = Object.values(ResourceType);
  locationId!: string;
  resources: ResourceDto[] | undefined = undefined;
  location!: LocationDto;

  availableSlotsByResource: ResourceSlots[] = [];

  constructor(
    private route: ActivatedRoute,
    private reservationsService: ReservationsService,
    private resourcesService: ResourcesService,
    private locationsService: LocationsService
  ) {
  }

  ngOnInit(): void {
    this.locationId = this.route.snapshot.paramMap.get('locationId')!;

    this.locationsService.locationsLocationIdGet(this.locationId)
      .pipe(
        tap(location => this.location = location)
      )
      .subscribe();
  }

  search() {
    const date = this.dateControl.value;

    if (!date) return;

    const from = startOfDay(date);
    const to = startOfNextDay(date);

    this.getResources()
      .pipe(
        tap(resources => this.resources = resources),
        switchMap(resources => {
          return this.getReservations(from, to, resources.map(x => x.id!));
        }),
        tap(reservations => this.availableSlotsByResource = this.findSlots(from, reservations))
      ).subscribe();
  }

  private getResources() {
    const resourceTypes = this.resourceTypeControl.value ? [this.resourceTypeControl.value] : [];

    return this.resourcesService.resourcesGet([], [this.locationId], resourceTypes, 0, 100)
      .pipe(
        map(x => x.collection ?? [])
      );
  }

  private getReservations(from: Date, to: Date, resourceIds: string[] | undefined) {
    return this.reservationsService.reservationsGet(
      [],
      [],
      [this.locationId],
      resourceIds ?? [],
      [ReservationStatus.Created],
      from.toISOString(),
      to.toISOString(),
      0,
      100
    ).pipe(
      map(x => x.collection ?? [])
    );
  }

  private findSlots(date: Date, reservations: ReservationDto[]) {
    const busyByResource = new Map<string, Array<{ from: Date; to: Date }>>();
    reservations.forEach(r => {
      const resourceId = r.resourceId!;
      if (!busyByResource.has(resourceId)) busyByResource.set(resourceId, []);
      busyByResource.get(resourceId)!.push({ from: new Date(r.from!), to: new Date(r.to!) });
    });

    const slotSizeMinutes = this.minReservationTime;
    const calendarSettings = this.location.calendarSettings!;
    const availableFrom = calendarSettings.availableFrom!;
    const availableTo = calendarSettings.availableTo!;

    const slotsPerResource: ResourceSlots[] = [];

    this.resources?.forEach(resource => {
      const resourceId = resource.id!;
      const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

      const [startHour, startMin] = availableFrom.split(':').map(Number);
      const [endHour, endMin] = availableTo.split(':').map(Number);

      const availableFromUTC = new Date(dayStart);
      availableFromUTC.setUTCHours(startHour, startMin);

      const availableToUTC = new Date(dayStart);
      availableToUTC.setUTCHours(endHour, endMin);

      const busy = busyByResource.get(resourceId) || [];

      const slots: Slot[] = [];
      let current = new Date(availableFromUTC);

      while (current < availableToUTC) {
        const end = new Date(current.getTime() + slotSizeMinutes * 60000);

        if (end > availableToUTC) break;

        const isFree = !busy.some(b => current < b.to && end > b.from);

        if (isFree) slots.push({ from: current, to: end });

        current = end;
      }

      if (slots.length > 0) {
        slotsPerResource.push({ resource, location: this.location, slots });
      }
    });

    return slotsPerResource;
  }
}
