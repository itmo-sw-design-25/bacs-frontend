import { Component, Input } from '@angular/core';
import { AddressPipe } from '@shared/pipes/address.pipe';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { TimeTrimPipe } from '@shared/pipes/trim-time.pipe';
import { LocationDto } from '@api/models/locationDto';
import { DayOfWeekPipe } from '@shared/pipes/day-of-week.pipe';
import { RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '@core/auth.service';

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports: [
    AddressPipe,
    MatIcon,
    NgOptimizedImage,
    TimeTrimPipe,
    NgIf,
    RouterLink,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './location-card.component.html',
  styleUrl: './location-card.component.scss'
})
export class LocationCardComponent {
  readonly noImage = 'https://bacs.space/s3/static/front/no-image-placeholder.svg';

  @Input() location!: LocationDto;

  get isAdmin(): boolean {
    return this.authService.isAdmin || this.authService.isSuperAdmin;
  }

  constructor(private dayOfWeekPipe: DayOfWeekPipe, private authService: AuthService) {
  }

  get displayDays(): string {
    const days = this.location?.calendarSettings?.availableDaysOfWeek;
    return days?.map(day => this.dayOfWeekPipe.transform(day)).join(', ') || 'не указано';
  }
}
