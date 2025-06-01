import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourceDto } from '@api/models/resourceDto';
import { ResourcesService } from '@api/services/resources.service';

@Component({
  selector: 'bacs-resource-delete-dialog',
  templateUrl: './resource-delete-dialog.component.html',
  styleUrls: ['./resource-delete-dialog.component.scss'],
  standalone: true,
  imports: [
    MatButton
  ]
})
export class ResourceDeleteDialogComponent {
  constructor(
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { resource: ResourceDto },
    private dialogRef: MatDialogRef<ResourceDeleteDialogComponent>,
    private resourcesService: ResourcesService
  ) {
  }

  confirm(): void {
    const resourceId = this.data.resource.id;

    if (!resourceId) return;

    this.resourcesService.resourcesResourceIdDelete(resourceId)
      .subscribe({
        next: () => {
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Ресурс успешно удалён!' }
          });
          this.dialogRef.close({ isSuccess: true, resourceId: resourceId });
        },
        error: () => this.dialogRef.close({ isSuccess: false })
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
