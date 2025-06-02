import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationDto } from '@api/models/locationDto';
import { LocationsService } from '@api/services/locations.service';

@Component({
  selector: 'bacs-location-delete-dialog',
  templateUrl: './location-delete-dialog.component.html',
  styleUrls: ['./location-delete-dialog.component.scss'],
  standalone: true,
  imports: [MatButton]
})
export class LocationDeleteDialogComponent {
  constructor(
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { location: LocationDto },
    private dialogRef: MatDialogRef<LocationDeleteDialogComponent>,
    private locationsService: LocationsService
  ) {}

  confirm(): void {
    const locationId = this.data.location.id;

    if (!locationId) return;

    this.locationsService.locationsLocationIdDelete(locationId).subscribe({
      next: () => {
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Локация успешно удалена!' }
        });
        this.dialogRef.close({ isSuccess: true, locationId: locationId });
      },
      error: () => this.dialogRef.close({ isSuccess: false })
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
