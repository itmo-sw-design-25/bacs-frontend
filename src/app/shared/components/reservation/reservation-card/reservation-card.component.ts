import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReservationDto } from '@api/models/reservationDto';
import { DatePipe, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { ReservationCancelDialogComponent } from '@shared/components/reservation/reservation-cancel-dialog/reservation-cancel-dialog.component';
import { MatIconButton } from '@angular/material/button';
import { ReservationCreateDialogComponent } from '@shared/components/reservation/reservation-create-dialog/reservation-create-dialog.component';
import { LocationDto } from '@api/models/locationDto';
import { ResourceDto } from '@api/models/resourceDto';
import { MatIcon } from '@angular/material/icon';
import { AddressPipe } from '@shared/pipes/address.pipe';
import { ResourceTypePipe } from '@shared/pipes/resource-type.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { startOfDay } from '@shared/utils/date.utils';
import { ReservationStatusPipe } from '@shared/pipes/reservation-status.pipe';
import { NoImage } from '@shared/utils/image.utils';

@Component({
  selector: 'bacs-reservation-card',
  standalone: true,
  templateUrl: './reservation-card.component.html',
  styleUrls: ['./reservation-card.component.scss'],
  imports: [
    DatePipe,
    NgIf,
    NgOptimizedImage,
    MatIcon,
    AddressPipe,
    ResourceTypePipe,
    MatIconButton,
    MatTooltip,
    NgClass,
    ReservationStatusPipe
  ]
})
export class ReservationCardComponent {
  @Input() reservation!: ReservationDto;
  @Input() resource!: ResourceDto;
  @Input() location!: LocationDto;

  @Output() cancelled = new EventEmitter<string>();
  @Output() created = new EventEmitter<ReservationDto>();
  @Output() updated = new EventEmitter<ReservationDto>();
  protected readonly NoImage = NoImage;

  constructor(private dialog: MatDialog) {}

  get isUpcoming(): boolean {
    return (
      new Date(this.reservation.to!) > startOfDay(new Date()) &&
      this.reservation.status != 'Cancelled'
    );
  }

  get canRepeat(): boolean {
    return !this.isUpcoming;
  }

  openCancelDialog(): void {
    const dialogRef = this.dialog.open(ReservationCancelDialogComponent, {
      width: '500px',
      data: { reservation: this.reservation }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result.isSuccess) return;
      this.cancelled.emit(this.reservation.id!);
    });
  }

  openRepeatDialog(): void {
    const dialogRef = this.dialog.open(ReservationCreateDialogComponent, {
      width: '500px',
      data: {
        resource: this.resource,
        location: this.location,
        from: this.reservation.from,
        to: this.reservation.to,
        mode: 'repeat'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result.isSuccess) return;
      this.created.emit(result.reservation);
    });
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(ReservationCreateDialogComponent, {
      width: '500px',
      data: {
        reservation: this.reservation,
        resource: this.resource,
        location: this.location,
        from: this.reservation.from,
        to: this.reservation.to,
        mode: 'edit'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result.isSuccess) return;
      this.updated.emit(result.reservation);
    });
  }
}
