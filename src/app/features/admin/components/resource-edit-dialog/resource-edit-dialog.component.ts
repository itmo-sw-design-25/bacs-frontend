import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { NgForOf } from '@angular/common';
import { ENTER } from '@angular/cdk/keycodes';
import { ResourceDto } from '@api/models/resourceDto';
import { ResourceType } from '@api/models/resourceType';
import { ResourcesService } from '@api/services/resources.service';
import { CreateResourceRequest } from '@api/models/createResourceRequest';
import { UpdateResourceRequest } from '@api/models/updateResourceRequest';
import { ResourceTypePipe } from '@shared/pipes/resource-type.pipe';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageUploaderComponent } from '@shared/components/image-uploader/image-uploader.component';
import { NoImage } from '@shared/utils/image.utils';
import { MatIcon, MatIconModule } from '@angular/material/icon';

type Mode = 'create' | 'edit';

@Component({
  selector: 'bacs-resource-edit-dialog',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatLabel,
    MatIconModule,
    MatChipsModule,
    ResourceTypePipe,
    ImageUploaderComponent,
    MatIcon
  ],
  templateUrl: './resource-edit-dialog.component.html',
  styleUrls: ['./resource-edit-dialog.component.scss']
})
export class ResourceEditDialogComponent {
  form: FormGroup;
  imageFile: File | null = null;
  readonly resourceTypes = Object.values(ResourceType);
  readonly separatorKeysCodes = [ENTER] as const;
  protected readonly NoImage = NoImage;

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ResourceEditDialogComponent>,
    private resourcesService: ResourcesService,
    @Inject(MAT_DIALOG_DATA)
    public data: { mode: Mode; locationId?: string; resource?: ResourceDto }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      floor: [1, Validators.required],
      equipment: [[]]
    });

    if (this.data.mode === 'edit' && this.data.resource) {
      const r = this.data.resource;
      this.form.patchValue({
        name: r.name,
        description: r.description,
        type: r.type,
        floor: r.floor,
        equipment: r.equipment ?? []
      });
    }
  }

  get equipment(): string[] {
    return this.form.get('equipment')?.value ?? [];
  }

  addEquipment(e: MatChipInputEvent): void {
    const value = (e.value || '').trim();
    if (value) this.form.patchValue({ equipment: [...this.equipment, value] });
    e.chipInput?.clear();
  }

  removeEquipment(index: number): void {
    const arr = [...this.equipment];
    arr.splice(index, 1);
    this.form.patchValue({ equipment: arr });
  }

  onFileSelected(file: File): void {
    if (!file) return;
    this.imageFile = file;
  }

  save(): void {
    if (this.form.invalid) return;
    const { name, description, type, floor, equipment } = this.form.value;

    if (this.data.mode === 'create' && this.data.locationId) {
      const request: CreateResourceRequest = {
        name,
        description,
        type,
        floor,
        equipment,
        locationId: this.data.locationId
      };

      this.resourcesService.resourcesPost(request).subscribe({
        next: (resource) => {
          this.uploadImage(resource.id!);
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Ресурс успешно создан' }
          });
          this.dialogRef.close({ resourceId: resource.id, isSuccess: true });
        },
        error: () => this.dialogRef.close({ isSuccess: false })
      });
    }

    if (this.data.mode === 'edit' && this.data.resource?.id) {
      const request: UpdateResourceRequest = { name, description, type, floor, equipment };
      this.resourcesService.resourcesResourceIdPut(this.data.resource.id, request).subscribe({
        next: (resource) => {
          this.uploadImage(this.data.resource!.id!);
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Ресурс успешно обновлён' }
          });
          this.dialogRef.close({ resourceId: resource.id, isSuccess: true });
        },
        error: () => this.dialogRef.close({ isSuccess: false })
      });
    }
  }

  uploadImage(resourceId: string): void {
    if (!this.imageFile) return;
    this.resourcesService.resourcesResourceIdImagePut(resourceId, this.imageFile).subscribe();
  }
}
