import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgIf, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UntilDestroy } from '@ngneat/until-destroy';
import { UserProfileComponent } from '@shared/components/user-profile/user-profile.component';
import { AuthService } from '@core/auth.service';
import { CurrentUserService } from '@shared/services/current-user.service';

@Component({
  selector: 'bacs-header',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    RouterLinkActive,
    NgOptimizedImage,
    FormsModule,
    MatCheckboxModule,
    UserProfileComponent,
    AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
@UntilDestroy({ checkProperties: true })
export class HeaderComponent {
  constructor(
    private authService: AuthService,
    private currentUser: CurrentUserService
  ) {}

  get isAuthenticated() {
    return !!this.authService.token;
  }

  get isAdmin() {
    return this.currentUser.isAdmin();
  }

  get isSuperAdmin() {
    return this.currentUser.isSuperAdmin;
  }
}
