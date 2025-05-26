import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { ResourceSlots } from '@core/models/resource-slots';
import { ReservationSlotPipe } from '@shared/pipes/reservation-slot.pipe';
import { ResourceCardComponent } from '@shared/components/resource/resource-card/resource-card.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [NgForOf, NgIf, ReservationSlotPipe, ResourceCardComponent],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  @Input() resourceSlots: ResourceSlots[] = [];
}
