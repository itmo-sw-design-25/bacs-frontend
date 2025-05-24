import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-my-reservations-page',
  standalone: true,
  imports: [],
  templateUrl: './my-reservations-page.component.html',
  styleUrl: './my-reservations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReservationsPageComponent {}
