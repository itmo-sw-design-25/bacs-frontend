import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { UsersService } from '@api/services/users.service';
import { debounceTime, distinctUntilChanged, Subject, tap } from 'rxjs';
import { UpdateUserRequest } from '@api/models/updateUserRequest';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import { UntilDestroy } from '@ngneat/until-destroy';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    RouterLinkActive,
    MatDivider,
    NgOptimizedImage,
    FormsModule,
    MatCheckbox,
    MatCheckboxModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
@UntilDestroy({ checkProperties: true })
export class HeaderComponent {
  readonly user = this.authService.user;
  enableEmailNotifications: boolean | undefined;
  email: string | undefined;

  emailChanged$ = new Subject<string>();
  enableEmailNotificationsChanged$ = new Subject<boolean>();

  constructor(private authService: AuthService, private userService: UsersService, private snackBar: MatSnackBar) {
  }

  getUserInfo() {
    if (!this.user) return;

    this.userService.usersUserIdGet(this.user.user_id)
      .pipe(
        tap((user) => {
          this.enableEmailNotifications = user.enableEmailNotifications;
          this.email = user.email!;
        })
      )
      .subscribe();

    this.emailChanged$
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(newEmail => this.updateUser(newEmail, this.enableEmailNotifications!));

    this.enableEmailNotificationsChanged$
      .pipe(
        debounceTime(250),
        distinctUntilChanged()
      )
      .subscribe(newValue => this.updateUser(this.email!, newValue));
  }

  onEmailChange(newValue: string) {
    this.emailChanged$.next(newValue);
  }

  onEmailNotificationsChange(newValue: boolean) {
    this.enableEmailNotificationsChanged$.next(newValue);
  }

  updateUser(email: string, enableEmailNotifications: boolean) {
    const request = { email, enableEmailNotifications } as UpdateUserRequest;

    this.userService.usersUserIdPut(this.user!.user_id, request).subscribe({
      next: () => {
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Настройки профиля успешно изменены!' }
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

