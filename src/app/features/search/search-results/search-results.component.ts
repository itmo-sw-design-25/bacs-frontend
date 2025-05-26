import { Component, Input } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ResourceSlots, Slot } from '@core/models/resource-slots';
import { ResourceCardComponent } from '@shared/components/resource/resource-card/resource-card.component';
import { MatDialog } from '@angular/material/dialog';
import {
  ReservationCreateDialogComponent
} from '@shared/components/reservation/reservation-create-dialog/reservation-create-dialog.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ResourceCardComponent,
    DatePipe
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  @Input() resourceSlots: ResourceSlots[] = [];

  selecting: boolean = false;
  startSlot: Slot | null = null;
  hoveredSlot: Slot | null = null;
  selectedResourceId: string | undefined = undefined;

  constructor(private dialog: MatDialog) {
  }

  onSlotClick(slot: Slot, resourceSlot: ResourceSlots): void {
    const resourceId = resourceSlot.resource.id;

    if (!this.selecting) {
      this.selecting = true;
      this.startSlot = slot;
      this.selectedResourceId = resourceId;
      return;
    }

    if (this.selectedResourceId !== resourceId) return;

    const from = this.startSlot!.from;
    const to = slot.to;

    this.dialog.open(ReservationCreateDialogComponent, {
      width: '500px',
      data: {
        from,
        to,
        resource: resourceSlot.resource,
        location: resourceSlot.location,
        mode: 'create'
      }
    });

    this.resetSelection();
  }

  onSlotHover(slot: Slot, resourceId: string): void {
    if (this.selecting && this.selectedResourceId === resourceId) {
      this.hoveredSlot = slot;
    }
  }

  isSlotSelected(slot: Slot, resourceId: string): boolean {
    if (!this.selecting || this.selectedResourceId !== resourceId || !this.startSlot || !this.hoveredSlot) {
      return false;
    }

    const from = new Date(this.startSlot.from);
    const to = new Date(this.hoveredSlot.to);
    const current = new Date(slot.from);

    return from <= current && current < to;
  }

  resetSelection(): void {
    this.selecting = false;
    this.startSlot = null;
    this.hoveredSlot = null;
    this.selectedResourceId = undefined;
  }
}
