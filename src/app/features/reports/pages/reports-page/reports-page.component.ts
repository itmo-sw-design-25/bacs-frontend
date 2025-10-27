import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { HttpResponse } from '@angular/common/http';

import { ReportsService } from '@api/services/reports.service';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatLabel, MatSelect } from '@angular/material/select';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { LocationsService } from '@api/services/locations.service';
import { ResourcesService } from '@api/services/resources.service';
import { UsersService } from '@api/services/users.service';

type ReportId = 'reservations';

interface EntityOption {
  id: string;
  name: string;
}

@Component({
  selector: 'bacs-reports-page',
  standalone: true,
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatIcon,
    MatSelect,
    MatOption,
    MatLabel,
    MatDatepickerToggle,
    MatNativeDateModule,
    MatProgressBar,
    MatDatepickerInput,
    MatDatepicker,
    MatPrefix,
    MatSuffix,
    MatIconButton
  ]
})
export class ReportsPageComponent implements OnInit {
  loading = false;

  locations: EntityOption[] = [];
  resources: EntityOption[] = [];
  users: EntityOption[] = [];

  locationsPage = 0;
  resourcesPage = 0;
  usersPage = 0;
  readonly pageSize = 10;
  locationsLoading = false;
  resourcesLoading = false;
  usersLoading = false;
  locationsHasMore = true;
  resourcesHasMore = true;
  usersHasMore = true;

  form = this.fb.group({
    report: this.fb.control<ReportId>('reservations', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    from: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
    to: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
    locationId: this.fb.control<string | null>(null),
    resourceId: this.fb.control<string | null>(null),
    userId: this.fb.control<string | null>(null)
  });

  reports = [
    {
      id: 'reservations' as ReportId,
      title: 'Отчёт по бронированиям',
      description: 'Выгрузка бронирований за выбранный период в формате XLSX.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private reportsService: ReportsService,
    private locationsService: LocationsService,
    private resourcesService: ResourcesService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadLocations();
    this.loadResources();
    this.loadUsers();
  }

  async loadLocations() {
    if (this.locationsLoading || !this.locationsHasMore) return;
    this.locationsLoading = true;
    try {
      const res = await firstValueFrom(
        this.locationsService.locationsGet([], this.locationsPage * this.pageSize, this.pageSize)
      );
      const items = (res?.collection ?? []).map((l: any) => ({ id: l.id, name: l.name }));
      this.locations.push(...items);
      this.locationsPage++;
      if (items.length < this.pageSize) this.locationsHasMore = false;
      this.cdr.markForCheck();
    } finally {
      this.locationsLoading = false;
    }
  }

  async loadResources() {
    if (this.resourcesLoading || !this.resourcesHasMore) return;
    this.resourcesLoading = true;
    try {
      const res = await firstValueFrom(
        this.resourcesService.resourcesGet(
          [],
          [],
          [],
          this.resourcesPage * this.pageSize,
          this.pageSize
        )
      );
      const items = (res?.collection ?? []).map((r: any) => ({ id: r.id, name: r.name }));
      this.resources.push(...items);
      this.resourcesPage++;
      if (items.length < this.pageSize) this.resourcesHasMore = false;
      this.cdr.markForCheck();
    } finally {
      this.resourcesLoading = false;
    }
  }

  async loadUsers() {
    if (this.usersLoading || !this.usersHasMore) return;
    this.usersLoading = true;
    try {
      const res = await firstValueFrom(
        this.usersService.usersGet([], this.usersPage * this.pageSize, this.pageSize)
      );
      const items = (res?.collection ?? []).map((u: any) => ({
        id: u.id,
        name: u.name + ' (' + u.email + ')'
      }));
      this.users.push(...items);
      this.usersPage++;
      if (items.length < this.pageSize) this.usersHasMore = false;
      this.cdr.markForCheck();
    } finally {
      this.usersLoading = false;
    }
  }

  onLocationsScroll() {
    this.loadLocations();
  }

  onResourcesScroll() {
    this.loadResources();
  }

  onUsersScroll() {
    this.loadUsers();
  }

  async onGenerate(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    try {
      const from = this.form.value.from as Date;
      const to = this.form.value.to as Date;

      const fromStr = this.toDateString(from);
      const toStr = this.toDateString(to);

      const userId = this.form.value.userId ?? undefined;
      const resourceId = this.form.value.resourceId ?? undefined;
      const locationId = this.form.value.locationId ?? undefined;

      const response = (await firstValueFrom(
        this.reportsService.reportsReservationsPost(
          fromStr,
          toStr,
          userId,
          resourceId,
          locationId,
          'response',
          true
        )
      )) as HttpResponse<Blob>;

      const blob = response.body ?? new Blob([]);
      const fileName = 'report_' + this.form.value.report + `_${fromStr}_to_${toStr}.xlsx`;

      this.downloadBlob(blob, fileName!);

      this.snackBar.openFromComponent(SuccessSnackbarComponent, {
        data: { message: 'Отчёт сформирован' }
      });
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /** Формат: YYYY-MM-dd (локальная дата, без времени) */
  private toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  loadLocationsOnOpen(opened: boolean) {
    if (opened && this.locations.length === 0) {
      this.loadLocations();
    }
  }

  loadResourcesOnOpen(opened: boolean) {
    if (opened && this.resources.length === 0) {
      this.loadResources();
    }
  }

  loadUsersOnOpen(opened: boolean) {
    if (opened && this.users.length === 0) {
      this.loadUsers();
    }
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
}
