import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationDto } from '@api/models/locationDto';
import { LocationsService } from '@api/services/locations.service';
import { UpdateLocationRequest } from '@api/models/updateLocationRequest';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { NgForOf, NgOptimizedImage } from '@angular/common';
import { RussianDayOfWeek } from '@api/models/russianDayOfWeek';
import { DayOfWeekPipe } from '@shared/pipes/day-of-week.pipe';

@Component({
  selector: 'bacs-location-edit-form',
  standalone: true,
  templateUrl: './location-edit-form.component.html',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    MatOption,
    MatSelect,
    NgForOf,
    DayOfWeekPipe,
    NgOptimizedImage
  ],
  styleUrls: ['./location-edit-form.component.scss']
})
export class LocationEditFormComponent implements OnChanges {
  readonly noImage = 'https://bacs.space/s3/static/front/no-image-placeholder.svg';
  readonly daysOfWeek = Object.values(RussianDayOfWeek);
  readonly timeSlots: string[] = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00'
  ];

  @Input() location!: LocationDto;

  form: FormGroup;
  imageFile: File | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private locationsService: LocationsService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      description: [''],
      availableFrom: ['', Validators.required],
      availableTo: ['', Validators.required],
      daysOfWeek: ['']
    });
  }

  ngOnChanges(): void {
    if (!this.location) return;

    const { name, description, address, calendarSettings } = this.location;
    this.form.patchValue({
      name,
      description,
      address,
      availableFrom: calendarSettings?.availableFrom?.substring(0, 5),
      availableTo: calendarSettings?.availableTo?.substring(0, 5),
      daysOfWeek: calendarSettings?.availableDaysOfWeek
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length == 0) return;

    this.imageFile = input.files[0];
  }

  uploadImage(): void {
    if (!this.imageFile) return;

    const formData = new FormData();
    formData.append('image', this.imageFile);

    const file = formData.get('image') as File;

    this.locationsService.locationsLocationIdImagePut(this.location.id!, file).subscribe({
      next: (imageUrl) => {
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Фотография локации успешно обновлена!' }
        });

        this.location.imageUrl = imageUrl;
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const request = {
      name: this.form.value.name,
      description: this.form.value.description,
      address: this.form.value.address,
      calendarSettings: {
        availableFrom: this.form.value.availableFrom,
        availableTo: this.form.value.availableTo,
        availableDaysOfWeek: this.form.value.daysOfWeek
      }
    } as UpdateLocationRequest;

    this.locationsService.locationsLocationIdPut(this.location.id!, request)
      .subscribe({
        next: () => {
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Настройки локации успешно обновлены!' }
          });
        }
      });

    this.uploadImage();
  }
}
