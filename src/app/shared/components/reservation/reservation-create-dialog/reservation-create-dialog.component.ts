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
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle
} from '@angular/material/datepicker';
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
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'bacs-reservation-create-dialog',
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
    MatSuffix,
    MatIcon
  ]
})
export class ReservationCreateDialogComponent {
  readonly minReservationTime = 30;

  form: FormGroup;
  timeSlots: string[] = [];
  isEditMode = false;

  constructor(
    private reservationsService: ReservationsService,
    private snackBar: MatSnackBar,
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
    const from = new Date(date),
      to = new Date(date);

    const [fromHours, fromMinutes] = formValue.fromTime.split(':').map(Number);
    const [toHours, toMinutes] = formValue.toTime.split(':').map(Number);

    from.setHours(fromHours, fromMinutes, 0);
    to.setHours(toHours, toMinutes, 0);

    // если конец бронирования - 00:00, то обновляем дату окончания бронирования
    if (to.getHours() == 0 && to.getMinutes() == 0) {
      to.setDate(to.getDate() + 1);
    }

    switch (this.data.mode) {
      case 'create':
      case 'repeat': {
        const createRequest = {
          resourceId: this.data.resource?.id,
          locationId: this.data.location?.id,
          from: from.toISOString(),
          to: to.toISOString()
        } as CreateReservationRequest;

        this.reservationsService.reservationsPost(createRequest).subscribe({
          next: (reservation) => {
            this.snackBar.openFromComponent(SuccessSnackbarComponent, {
              data: { message: 'Резервация успешно создана!' }
            });

            this.dialogRef.close({ isSuccess: true, reservation: reservation });
          },
          error: () => this.dialogRef.close({ isSuccess: false })
        });

        break;
      }
      case 'edit': {
        const updateRequest = {
          from: from.toISOString(),
          to: to.toISOString()
        } as UpdateReservationRequest;

        this.reservationsService
          .reservationsReservationIdPut(this.data.reservation?.id!, updateRequest)
          .subscribe({
            next: (reservation) => {
              this.snackBar.openFromComponent(SuccessSnackbarComponent, {
                data: { message: 'Резервация успешно обновлена!' }
              });
              this.dialogRef.close({ isSuccess: true, reservation: reservation });
            },
            error: () => this.dialogRef.close({ isSuccess: false })
          });

        break;
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private calculateSlots(location: LocationDto | undefined) {
    if (!location?.calendarSettings) return;

    const calendarSettings = location.calendarSettings;

    const [fromHours, fromMinutes] = calendarSettings.availableFrom!.split(':').map(Number);
    const [toHours, toMinutes] = calendarSettings.availableTo!.split(':').map(Number);

    const date = new Date(); // сегодняшняя дата

    // Время начала и конца в UTC
    const startUtc = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), fromHours, fromMinutes)
    );
    const endUtc = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), toHours, toMinutes)
    );

    const step = this.minReservationTime;
    const slots: Date[] = [];

    let current = new Date(startUtc);
    while (current <= endUtc) {
      slots.push(new Date(current));
      current = new Date(current.getTime() + step * 60 * 1000); // шаг в минутах
    }

    this.timeSlots = slots.map((date) => formatTime(date));
  }
}
