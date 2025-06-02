import { Component, Input, OnChanges, OnInit } from '@angular/core';
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
import { NgForOf, NgIf } from '@angular/common';
import { RussianDayOfWeek } from '@api/models/russianDayOfWeek';
import { DayOfWeekPipe } from '@shared/pipes/day-of-week.pipe';
import { UserDto } from '@api/models/userDto';
import { UsersService } from '@api/services/users.service';
import { MatChip, MatChipListbox } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { ImageUploaderComponent } from '@shared/components/image-uploader/image-uploader.component';
import { NoImage } from '@shared/utils/image.utils';

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
    MatIcon,
    NgForOf,
    DayOfWeekPipe,
    MatChip,
    NgIf,
    MatChipListbox,
    ImageUploaderComponent
  ],
  styleUrls: ['./location-edit-form.component.scss']
})
export class LocationEditFormComponent implements OnInit, OnChanges {
  readonly daysOfWeek = Object.values(RussianDayOfWeek);
  readonly utcTimeSlots: string[] = [
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
  admins: UserDto[] = [];
  users: UserDto[] = [];

  addMode = false;
  removeMode = false;

  get usersNotAdmin(): UserDto[] {
    const adminIds = new Set(this.admins.map(a => a.id));
    return this.users.filter(u => !adminIds.has(u.id));
  }

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private locationsService: LocationsService,
    private usersService: UsersService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      description: [''],
      availableFrom: ['', Validators.required],
      availableTo: ['', Validators.required],
      daysOfWeek: [''],
      adminIds: ['']
    });
  }

  ngOnInit(): void {
    this.usersService.usersGet([], 0, 100)
      .subscribe(users => this.users = users.collection || []);

    const adminIds = this.location.adminIds || [];
    if (adminIds.length == 0) return;

    const userIds = this.users.map(x => x.id!);
    const missingAdminIds = adminIds.filter(x => !userIds.includes(x));

    if (missingAdminIds.length == 0) {
      this.admins = this.users.filter(x => adminIds.includes(x.id!));
    } else {
      this.usersService.usersGet(adminIds)
        .subscribe(users => this.admins = users.collection || []);
    }
  }

  ngOnChanges(): void {
    if (!this.location) return;

    const { name, description, address, calendarSettings, adminIds } = this.location;

    this.form.patchValue({
      name,
      description,
      address,
      availableFrom: calendarSettings?.availableFrom?.substring(0, 5),
      availableTo: calendarSettings?.availableTo?.substring(0, 5),
      daysOfWeek: calendarSettings?.availableDaysOfWeek,
      adminIds: adminIds
    });
  }

  onFileSelected(file: File | undefined): void {
    if (!file) return;

    this.imageFile = file;
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

  addAdmin(userId: string): void {
    const adminIds = this.form.value.adminIds || [];

    if (!adminIds.includes(userId)) {
      this.form.controls['adminIds'].patchValue([...adminIds, userId]);
      this.updateAdmins();
    }

    this.addMode = false;
    this.locationsService.locationsLocationIdAdminsUserIdPut(this.location.id!, userId)
      .subscribe({
        next: () => {
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Администратор локации успешно добавлен!' }
          });
        }
      });
  }

  removeAdmin(userId: string): void {
    const adminIds = this.form.value.adminIds || [];

    this.form.controls['adminIds'].patchValue(
      adminIds.filter((id: string) => id !== userId)
    );

    this.updateAdmins();
    this.removeMode = false;
    this.locationsService.locationsLocationIdAdminsUserIdDelete(this.location.id!, userId)
      .subscribe({
        next: () => {
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Администратор локации успешно удалён!' }
          });
        }
      });
  }

  private updateAdmins(): void {
    const adminIds = this.form.value.adminIds;
    this.admins = this.users.filter(u => adminIds.includes(u.id));
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

  protected readonly NoImage = NoImage;
}
