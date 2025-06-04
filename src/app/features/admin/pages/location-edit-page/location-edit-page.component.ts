import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationsService } from '@api/services/locations.service';
import { LocationDto } from '@api/models/locationDto';
import { NgIf } from '@angular/common';
import { LocationEditFormComponent } from '@features/admin/components/location-edit-form/location-edit-form.component';
import { ResourceListComponent } from '@features/admin/components/resource-list/resource-list.component';

type Mode = 'edit' | 'create';

@Component({
  selector: 'bacs-location-edit-page',
  templateUrl: './location-edit-page.component.html',
  styleUrls: ['./location-edit-page.component.scss'],
  standalone: true,
  imports: [NgIf, LocationEditFormComponent, ResourceListComponent]
})
export class LocationEditPageComponent implements OnInit {
  mode: Mode = 'edit';
  location: LocationDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private locationsService: LocationsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    if (id === 'new') {
      this.mode = 'create';
      this.location = {} as LocationDto;
    } else {
      this.mode = 'edit';
      this.locationsService.locationsLocationIdGet(id).subscribe({
        next: (location) => (this.location = location)
      });
    }
  }
}
