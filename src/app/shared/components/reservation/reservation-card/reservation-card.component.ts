import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReservationDto } from '@api/models/reservationDto';
import { DatePipe, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import {
  ReservationCancelDialogComponent
} from '@shared/components/reservation/reservation-cancel-dialog/reservation-cancel-dialog.component';
import { MatIconButton } from '@angular/material/button';
import {
  ReservationCreateDialogComponent
} from '@shared/components/reservation/reservation-create-dialog/reservation-create-dialog.component';
import { LocationDto } from '@api/models/locationDto';
import { ResourceDto } from '@api/models/resourceDto';
import { MatIcon } from '@angular/material/icon';
import { AddressPipe } from '@shared/pipes/address.pipe';
import { ResourceTypePipe } from '@shared/pipes/resource-type.pipe';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-reservation-card',
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
    NgClass
  ]
})
export class ReservationCardComponent {
  readonly noImage = 'https://bacs.space/s3/static/front/no-image-placeholder.svg';

  @Input() reservation!: ReservationDto;
  @Input() resource!: ResourceDto;
  @Input() location!: LocationDto;

  @Output() onCancelled = new EventEmitter<string>();
  @Output() onCreated = new EventEmitter<ReservationDto>();
  @Output() onUpdated = new EventEmitter<ReservationDto>();

  constructor(private dialog: MatDialog) {
  }

  get isUpcoming(): boolean {
    return new Date(this.reservation.to!) > new Date() && this.reservation.status != 'Cancelled';
  }

  get canRepeat(): boolean {
    return !this.isUpcoming;
  }

  openCancelDialog(): void {
    const dialogRef = this.dialog.open(ReservationCancelDialogComponent, {
      width: '500px',
      data: { reservation: this.reservation }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result.isSuccess) return;
      this.onCancelled.emit(this.reservation.id!);
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

    dialogRef.afterClosed().subscribe(result => {
      if (!result.isSuccess) return;
      this.onCreated.emit(result.reservation);
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

    dialogRef.afterClosed().subscribe(result => {
      if (!result.isSuccess) return;
      this.onUpdated.emit(result.reservation);
    });
  }

}
