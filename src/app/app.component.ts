import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { NgForOf, NgOptimizedImage } from '@angular/common';
import { LocationDto } from './core/api/models/locationDto';
import { LocationsService } from './core/api/services/locations.service';
import { tap } from 'rxjs';
import { TimeTrimPipe } from './shared/pipes/trim-time.pipe';
import { MatIconModule } from '@angular/material/icon';
import { AddressPipe } from './shared/pipes/address.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgForOf, NgOptimizedImage, TimeTrimPipe, MatIconModule, AddressPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  placeholder = 'https://placehold.co/240x160?text=No+Image';
  locations: LocationDto[] | null | undefined = [];

  constructor(private authService: AuthService, private locationsService: LocationsService) {
  }

  ngOnInit(): void {
    this.locationsService.locationsGet()
      .pipe(
        tap((response) => this.locations = response.collection)
      )
      .subscribe();
  }

  get token() {
    return this.authService.token;
  }

  copyToken() {
    if (!this.token) return;

    navigator.clipboard.writeText(this.token);
  }
}
