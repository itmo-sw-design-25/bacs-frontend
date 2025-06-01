import { Component, Input, OnInit } from '@angular/core';
import { ResourceDto } from '@api/models/resourceDto';
import { ResourcesService } from '@api/services/resources.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ResourceCardComponent } from '@shared/components/resource/resource-card/resource-card.component';
import {
  ResourceEditDialogComponent
} from '@features/admin/components/resource-edit-dialog/resource-edit-dialog.component';
import {
  ResourceDeleteDialogComponent
} from '@features/admin/components/resource-delete-dialog/resource-delete-dialog.component';

@Component({
  selector: 'bacs-resource-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
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
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources(): void {
    this.resourcesService.resourcesGet(
      [],
      [this.locationId],
      [],
      0,
      100
    ).subscribe({
      next: (resources) => this.resources = resources.collection!
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
      if (!result?.isSuccess) return;

      this.resourcesService.resourcesGet([result.resourceId])
        .subscribe({
          next: (resources) => this.resources = [...this.resources, ...resources.collection!]
        });
    });
  }

  editResource(resource: ResourceDto): void {
    const dialogRef = this.dialog.open(ResourceEditDialogComponent, {
      width: '600px',
      data: { mode: 'edit', resource }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result?.isSuccess) return;

      this.resourcesService.resourcesGet([result.resourceId])
        .subscribe({
          next: (resources) => {
            if (resources.collection?.length == 0) return;

            const index = this.resources.findIndex(x => x.id === result.resourceId);
            this.resources[index] = resources.collection![0];
          }
        });
    });
  }

  deleteResource(resource: ResourceDto): void {
    const dialogRef = this.dialog.open(ResourceDeleteDialogComponent, {
      width: '500px',
      data: { resource }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result?.isSuccess) return;
      this.resources = this.resources.filter(r => r.id !== result.resourceId);
    });
  }
}
