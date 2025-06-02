import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AddressPipe } from '@shared/pipes/address.pipe';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe, NgIf, NgOptimizedImage } from '@angular/common';
import { TimeTrimPipe } from '@shared/pipes/trim-time.pipe';
import { LocationDto } from '@api/models/locationDto';
import { DayOfWeekPipe } from '@shared/pipes/day-of-week.pipe';
import { RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { CurrentUserService } from '@shared/services/current-user.service';
import { NoImage } from '@shared/utils/image.utils';

@Component({
  selector: 'bacs-location-card',
  standalone: true,
  imports: [
    AddressPipe,
    MatIcon,
    NgOptimizedImage,
    TimeTrimPipe,
    NgIf,
    RouterLink,
    MatIconButton,
    MatTooltip,
    AsyncPipe
  ],
  templateUrl: './location-card.component.html',
  styleUrl: './location-card.component.scss'
})
export class LocationCardComponent {
  @Input() location!: LocationDto;
  @Input() editEnabled: boolean = false;
  @Output() deleteClick = new EventEmitter<void>();

  isAdmin(locationId?: string) {
    return this.currentUser.isAdmin(locationId);
  }

  constructor(
    private dayOfWeekPipe: DayOfWeekPipe,
    private currentUser: CurrentUserService
  ) {
  }

  get displayDays(): string {
    const days = this.location?.calendarSettings?.availableDaysOfWeek;
    return days?.map(day => this.dayOfWeekPipe.transform(day)).join(', ') || 'не указано';
  }

  deleteIconClick(event: any): void {
    event.stopPropagation();
    this.deleteClick.emit();
  }

  protected readonly NoImage = NoImage;
}
