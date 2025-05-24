import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { LocationDto } from '@api/models/locationDto';
import { LocationsService } from '@api/services/locations.service';
import { Router } from '@angular/router';
import { LocationCardComponent } from '@shared/components/location-card/location-card.component';

@Component({
  selector: 'app-locations-list',
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
  locations: LocationDto[] = [];
  limitOptions = [5, 10, 20];

  offset = 0;
  limit = 5;
  isLoading = false;
  hasMore = true;

  constructor(private locationsService: LocationsService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  openSearchPage(locationId: string): void {
    this.router.navigate(['/search', locationId]);
  }

  loadLocations(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this.locationsService.locationsGet([], this.offset, this.limit).subscribe({
      next: (res) => {
        const newItems = res.collection ?? [];
        this.locations = [...this.locations, ...newItems];
        this.offset += this.limit;
        this.hasMore = newItems.length === this.limit;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
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

