import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationsService } from '@api/services/locations.service';
import { LocationDto } from '@api/models/locationDto';
import { NgIf } from '@angular/common';
import { LocationEditFormComponent } from '@features/admin/components/location-edit-form/location-edit-form.component';
import { ResourceListComponent } from '@features/admin/components/resource-list/resource-list.component';

@Component({
  selector: 'bacs-location-edit-page',
  templateUrl: './location-edit-page.component.html',
  styleUrls: ['./location-edit-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    LocationEditFormComponent,
    ResourceListComponent
  ]
})
export class LocationEditPageComponent implements OnInit {
  location: LocationDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private locationsService: LocationsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.locationsService.locationsLocationIdGet(id).subscribe({
      next: (location) => (this.location = location)
    });
  }
}
