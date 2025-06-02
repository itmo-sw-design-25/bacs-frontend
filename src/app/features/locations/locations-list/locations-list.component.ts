import { Component, Input, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { LocationDto } from '@api/models/locationDto';
import { LocationsService } from '@api/services/locations.service';
import { Router } from '@angular/router';
import { LocationCardComponent } from '@shared/components/location/location-card/location-card.component';
import { CurrentUserService } from '@shared/services/current-user.service';
import { MatDialog } from '@angular/material/dialog';
import {
  LocationDeleteDialogComponent
} from '@features/admin/components/location-delete-dialog/location-delete-dialog.component';

type Mode = 'view' | 'admin';

@Component({
  selector: 'bacs-locations-list',
  standalone: true,
  imports: [
    NgForOf,
    MatIconModule,
    NgIf,
    MatSelect,
    MatOption,
    MatFormField,
    MatLabel,
    MatButton,
    LocationCardComponent
  ],
  templateUrl: './locations-list.component.html',
  styleUrl: './locations-list.component.scss'
})
export class LocationsListComponent implements OnInit {
  @Input() title: string = 'Доступные локации';
  @Input() mode: Mode = 'view';

  locations: LocationDto[] = [];
  limitOptions = [5, 10, 20];

  offset = 0;
  limit = 5;
  isLoading = false;
  hasMore = true;
  totalCount = 0;

  constructor(
    private locationsService: LocationsService,
    private currentUser: CurrentUserService,
    private router: Router,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    if (this.mode == 'admin' && !this.currentUser.isSuperAdmin) {
      this.currentUser.user$.subscribe(user => this.loadLocations(user.adminIn!));
    } else {
      this.loadLocations();
    }
  }

  openSearchPage(locationId: string): void {
    this.router.navigate(['/search', locationId]);
  }

  loadLocations(locationIds: string[] = []): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this.locationsService.locationsGet(locationIds, this.offset, this.limit)
      .subscribe({
        next: (locations) => {
          const newItems = locations.collection ?? [];
          this.locations = [...this.locations, ...newItems];
          this.offset += this.limit;
          this.hasMore = newItems.length === this.limit;
          this.totalCount = locations.totalCount!;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
  }

  deleteLocation(location: LocationDto): void {
    const dialogRef = this.dialog.open(LocationDeleteDialogComponent, {
      width: '500px',
      data: { location }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result?.isSuccess) return;
      this.locations = this.locations.filter(r => r.id !== result.locationId);
      this.totalCount -= 1;
    });
  }

  changeLimit(newLimit: number): void {
    this.limit = newLimit;
    this.offset = 0;
    this.locations = [];
    this.hasMore = true;
    this.loadLocations();
  }
}

