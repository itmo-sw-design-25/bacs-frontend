import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocationsService } from '@api/services/locations.service';
import { ResourcesService } from '@api/services/resources.service';
import { UsersService } from '@api/services/users.service';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle
} from '@angular/material/datepicker';

export interface ReservationsReportParams {
  from: Date;
  to: Date;
  locationId: string | null;
  resourceId: string | null;
  userId: string | null;
}

interface IdName {
  id: string;
  name: string;
}

@Component({
  selector: 'bacs-reservations-report',
  standalone: true,
  templateUrl: './reservations-report.component.html',
  styleUrls: ['./reservations-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatIcon,
    MatSelect,
    MatOption,
    MatLabel,
    MatDatepicker,
    MatDatepickerToggle,
    MatPrefix,
    MatSuffix,
    MatIconButton,
    MatButton,
    MatDatepickerInput
  ]
})
export class ReservationsReportComponent implements OnDestroy {
  form: FormGroup;

  locations: IdName[] = [];
  resources: IdName[] = [];
  users: IdName[] = [];

  locationsPage = 0;
  resourcesPage = 0;
  usersPage = 0;
  readonly pageSize = 5;
  locationsLoading = false;
  resourcesLoading = false;
  usersLoading = false;
  locationsHasMore = true;
  resourcesHasMore = true;
  usersHasMore = true;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private locationsService: LocationsService,
    private resourcesService: ResourcesService,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      from: [null, Validators.required],
      to: [null, Validators.required],
      locationId: [null],
      resourceId: [null],
      userId: [null]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLocationsOnOpen() {
    this.locations = [];
    this.locationsPage = 0;
    this.locationsHasMore = true;
    this.loadMoreLocations();
  }

  loadMoreLocations() {
    if (this.locationsLoading || !this.locationsHasMore) return;

    this.locationsLoading = true;
    this.cdr.markForCheck();

    this.locationsService
      .locationsGet([], this.locationsPage * this.pageSize, this.pageSize)
      .pipe(
        tap((res: any) => {
          const items: IdName[] = (res?.collection ?? []).map((l: any) => ({
            id: l.id,
            name: l.name
          }));
          this.locations.push(...items);
          this.locationsPage++;
          if (items.length < this.pageSize) this.locationsHasMore = false;
          this.locationsLoading = false;
          this.cdr.markForCheck();
        }),
        catchError(() => {
          this.locationsLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  loadResourcesOnOpen() {
    this.resources = [];
    this.resourcesPage = 0;
    this.resourcesHasMore = true;
    this.loadMoreResources();
  }

  loadMoreResources() {
    if (this.resourcesLoading || !this.resourcesHasMore) return;

    this.resourcesLoading = true;
    this.cdr.markForCheck();

    this.resourcesService
      .resourcesGet([], [], [], this.resourcesPage * this.pageSize, this.pageSize)
      .pipe(
        tap((res: any) => {
          const items: IdName[] = (res?.collection ?? []).map((r: any) => ({
            id: r.id,
            name: r.name
          }));
          this.resources.push(...items);
          this.resourcesPage++;
          if (items.length < this.pageSize) this.resourcesHasMore = false;
          this.resourcesLoading = false;
          this.cdr.markForCheck();
        }),
        catchError(() => {
          this.resourcesLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  loadUsersOnOpen() {
    this.users = [];
    this.usersPage = 0;
    this.usersHasMore = true;
    this.loadMoreUsers();
  }

  loadMoreUsers() {
    if (this.usersLoading || !this.usersHasMore) return;

    this.usersLoading = true;
    this.cdr.markForCheck();

    this.usersService
      .usersGet([], this.usersPage * this.pageSize, this.pageSize)
      .pipe(
        tap((res: any) => {
          const items: IdName[] = (res?.collection ?? []).map((u: any) => ({
            id: u.id,
            name: u.name + ' (' + u.email + ')'
          }));
          this.users.push(...items);
          this.usersPage++;
          if (items.length < this.pageSize) this.usersHasMore = false;
          this.usersLoading = false;
          this.cdr.markForCheck();
        }),
        catchError(() => {
          this.usersLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  clearLocation(event: Event) {
    event.stopPropagation();
    this.form.get('locationId')?.setValue(null);
  }

  clearResource(event: Event) {
    event.stopPropagation();
    this.form.get('resourceId')?.setValue(null);
  }

  clearUser(event: Event) {
    event.stopPropagation();
    this.form.get('userId')?.setValue(null);
  }

  trackById(_: number, item: IdName): string {
    return item.id;
  }

  getParams() {
    return { valid: this.form.valid, value: this.form.value };
  }

  markAllAsTouched() {
    this.form.markAllAsTouched();
  }
}
