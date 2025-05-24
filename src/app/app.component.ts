import { Component } from '@angular/core';
import { AuthService } from './core/auth.service';
import { NgForOf } from '@angular/common';
import { LocationDto } from './core/api/models/locationDto';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bacs-ui';
  locations: LocationDto[] | null | undefined = [];

  constructor(private authService: AuthService) {
  }

  get token() {
    return this.authService.token;
  }

  copyToken() {
    if (!this.token) return;

    navigator.clipboard.writeText(this.token);
  }
}
