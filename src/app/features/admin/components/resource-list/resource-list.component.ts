import { Component, Input, OnInit } from '@angular/core';
import { ResourceDto } from '@api/models/resourceDto';
import { ResourcesService } from '@api/services/resources.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { CommonModule } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { ResourceCardComponent } from '@shared/components/resource/resource-card/resource-card.component';
import {
  ResourceEditDialogComponent
} from '@features/admin/components/resource-edit-dialog/resource-edit-dialog.component';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ResourceCardComponent,
    MatTooltip,
    ResourceCardComponent
  ],
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {
  @Input() locationId!: string;

  resources: ResourceDto[] = [];

  constructor(
    private resourcesService: ResourcesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources(): void {
    this.resourcesService.resourcesGet([], [this.locationId], [], 0, 100).subscribe({
      next: (res) => this.resources = res.collection ?? []
    });
  }

  createResource(): void {
    const dialogRef = this.dialog.open(ResourceEditDialogComponent,
      {
        width: '600px',
        data: {
          mode: 'create',
          locationId: this.locationId
        }
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadResources();
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Ресурс успешно создан' }
        });
      }
    });
  }

  editResource(resource: ResourceDto): void {
    const dialogRef = this.dialog.open(ResourceEditDialogComponent, {
      width: '600px',
      data: { mode: 'edit', resource }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadResources();
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Ресурс успешно обновлён' }
        });
      }
    });
  }

  deleteResource(resource: ResourceDto): void {
    const confirmed = confirm(`Удалить ресурс "${resource.name}"?`);
    if (!confirmed) return;

    this.resourcesService.resourcesResourceIdDelete(resource.id!).subscribe({
      next: () => {
        this.loadResources();
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Ресурс удалён' }
        });
      }
    });
  }
}
