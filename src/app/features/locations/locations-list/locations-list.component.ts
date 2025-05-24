import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { TimeTrimPipe } from '../../../shared/pipes/trim-time.pipe';
import { AddressPipe } from '../../../shared/pipes/address.pipe';
import { LocationDto } from '../../../core/api/models/locationDto';
import { LocationsService } from '../../../core/api/services/locations.service';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    TimeTrimPipe,
    MatIconModule,
    AddressPipe,
    NgIf,
    MatSelect,
    MatOption,
    MatFormField,
    MatLabel,
    MatButton
  ],
  templateUrl: './locations-list.component.html',
  styleUrl: './locations-list.component.scss'
})
export class LocationsListComponent implements OnInit {
  locations: LocationDto[] = [];
  placeholder = 'https://placehold.co/240x160?text=No+Image';
  limitOptions = [5, 10, 20];

  offset = 0;
  limit = 5;
  isLoading = false;
  hasMore = true;

  constructor(private locationsService: LocationsService) {
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this.locationsService.locationsGet(undefined, this.offset, this.limit).subscribe({
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

