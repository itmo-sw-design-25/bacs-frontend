import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationDto } from '@api/models/reservationDto';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { ResourceDto } from '@api/models/resourceDto';
import { LocationDto } from '@api/models/locationDto';
import { NgForOf } from '@angular/common';
import { ReservationsService } from '@api/services/reservations.service';
import { CreateReservationRequest } from '@api/models/createReservationRequest';
import { UpdateReservationRequest } from '@api/models/updateReservationRequest';
import { formatTime } from '@shared/utils/date.utils';

@Component({
  selector: 'app-reservation-create-dialog',
  templateUrl: './reservation-create-dialog.component.html',
  styleUrls: ['./reservation-create-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogContent,
    MatFormField,
    MatDatepickerToggle,
    MatDatepicker,
    MatDialogActions,
    MatButton,
    MatInput,
    MatDatepickerInput,
    MatLabel,
    ReactiveFormsModule,
    MatDialogTitle,
    MatSelect,
    MatOption,
    NgForOf,
    MatSuffix
  ]
})
export class ReservationCreateDialogComponent {
  readonly minReservationTime = 30;

  form: FormGroup;
  timeSlots: string[] = [];
  isEditMode = false;

  constructor(
    private reservationsService: ReservationsService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReservationCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      reservation?: ReservationDto;
      resource?: ResourceDto;
      location?: LocationDto;
      from?: string;
      to?: string;
      mode?: 'create' | 'repeat' | 'edit';
    }
  ) {
    this.isEditMode = data.mode === 'edit';

    const fromDate = data.from ? new Date(data.from) : null;
    const toDate = data.to ? new Date(data.to) : null;

    this.form = this.fb.group({
      location: [{ value: data.location?.name ?? '', disabled: true }],
      resource: [{ value: data.resource?.name ?? '', disabled: true }],
      date: [fromDate ? fromDate : new Date(), Validators.required],
      fromTime: [fromDate ? formatTime(fromDate) : '', Validators.required],
      toTime: [toDate ? formatTime(toDate) : '', Validators.required]
    });

    this.calculateSlots(data.location);
  }

  confirm(): void {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    const date = formValue.date as Date;
    const from = new Date(date), to = new Date(date);

    const [fromHours, fromMinutes] = formValue.fromTime.split(':').map(Number);
    const [toHours, toMinutes] = formValue.toTime.split(':').map(Number);

    from.setHours(fromHours, fromMinutes, 0);
    to.setHours(toHours, toMinutes, 0);

    switch (this.data.mode) {
      case 'create':
      case 'repeat':
        const createRequest = {
          resourceId: this.data.resource?.id,
          locationId: this.data.location?.id,
          from: from.toISOString(),
          to: to.toISOString()
        } as CreateReservationRequest;

        this.reservationsService.reservationsPost(createRequest)
          .subscribe({
            next: (reservation) => this.dialogRef.close({ isSuccess: true, reservation: reservation }),
            error: () => this.dialogRef.close({ isSuccess: false })
          });

        break;
      case 'edit':
        const updateRequest = {
          from: from.toISOString(),
          to: to.toISOString()
        } as UpdateReservationRequest;

        this.reservationsService.reservationsReservationIdPut(this.data.reservation?.id!, updateRequest)
          .subscribe({
            next: (reservation) => this.dialogRef.close({ isSuccess: true, reservation: reservation }),
            error: () => this.dialogRef.close({ isSuccess: false })
          });

        break;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private calculateSlots(location: LocationDto | undefined) {
    const calendarSettings = location?.calendarSettings!;

    const [fromHours, fromMinutes] = calendarSettings.availableFrom!.split(':');
    const [toHours, toMinutes] = calendarSettings.availableTo!.split(':');

    const start = Number(fromHours) * 60 + Number(fromMinutes);
    const end = Number(toHours) * 60 + Number(toMinutes);
    const step = this.minReservationTime;

    for (let mins = start; mins <= end; mins += step) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      this.timeSlots.push(formatted);
    }
  }
}
