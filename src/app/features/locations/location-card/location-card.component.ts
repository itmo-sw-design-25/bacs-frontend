import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports: [],
  templateUrl: './location-card.component.html',
  styleUrl: './location-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationCardComponent {}
