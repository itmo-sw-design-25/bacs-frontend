import { Component } from '@angular/core';
import { LocationsListComponent } from '@features/locations/locations-list/locations-list.component';

@Component({
  selector: 'bacs-admin-locations-list',
  standalone: true,
  imports: [
    LocationsListComponent
  ],
  templateUrl: './admin-locations-list.component.html'
})
export class AdminLocationsListComponent {

}
