import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReservationDto } from '@api/models/reservationDto';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { ReservationsService } from '@api/services/reservations.service';
import { ReservationStatus } from '@api/models/reservationStatus';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'bacs-reservation-cancel-dialog',
  templateUrl: './reservation-cancel-dialog.component.html',
  styleUrls: ['./reservation-cancel-dialog.component.scss'],
  standalone: true,
  imports: [DatePipe, MatButton]
})
export class ReservationCancelDialogComponent {
  constructor(
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { reservation: ReservationDto },
    private dialogRef: MatDialogRef<ReservationCancelDialogComponent>,
    private reservationsService: ReservationsService
  ) {}

  confirm(): void {
    const reservation = this.data.reservation;

    if (!reservation) return;
    if (reservation.status == ReservationStatus.Cancelled) return;

    this.reservationsService.reservationsReservationIdCancelPut(reservation.id!).subscribe({
      next: () => {
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Резервация успешно отменена!' }
        });
        this.dialogRef.close({ isSuccess: true, reservationId: reservation.id });
      },
      error: () => this.dialogRef.close({ isSuccess: false })
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
