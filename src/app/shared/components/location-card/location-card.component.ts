import { Component, Input } from '@angular/core';
import { AddressPipe } from '@shared/pipes/address.pipe';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { TimeTrimPipe } from '@shared/pipes/trim-time.pipe';
import { LocationDto } from '@api/models/locationDto';
import { DayOfWeekPipe } from '@shared/pipes/day-of-week.pipe';

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports: [
    AddressPipe,
    MatIcon,
    NgOptimizedImage,
    TimeTrimPipe,
    DayOfWeekPipe,
    NgIf
  ],
  templateUrl: './location-card.component.html',
  styleUrl: './location-card.component.scss'
})
export class LocationCardComponent {
  readonly noImage = 'https://placehold.co/240x160?text=No+Image';

  @Input() location!: LocationDto;

  constructor(private dayOfWeekPipe: DayOfWeekPipe) {
  }

  get displayDays(): string {
    const days = this.location?.calendarSettings?.availableDaysOfWeek;
    return days?.map(day => this.dayOfWeekPipe.transform(day)).join(', ') || 'не указано';
  }
}
