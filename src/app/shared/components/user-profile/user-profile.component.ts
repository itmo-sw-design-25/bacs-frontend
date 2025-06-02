import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription, tap } from 'rxjs';
import { AuthService } from '@core/auth.service';
import { UsersService } from '@api/services/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdateUserRequest } from '@api/models/updateUserRequest';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';

@Component({
  selector: 'bacs-user-profile',
  standalone: true,
  imports: [
    MatButton,
    MatCheckbox,
    MatDivider,
    MatIcon,
    MatMenu,
    MatMenuItem,
    NgIf,
    NgOptimizedImage,
    ReactiveFormsModule,
    MatMenuTrigger,
    FormsModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  readonly user = this.authService.user!;
  enableEmailNotifications: boolean | undefined;
  email: string | undefined;

  emailChanged$ = new Subject<string>();
  emailChangedSub: Subscription | undefined;
  enableEmailNotificationsChanged$ = new Subject<boolean>();
  enableEmailNotificationsSub: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userService
      .usersUserIdGet(this.user.user_id)
      .pipe(
        tap((user) => {
          this.enableEmailNotifications = user.enableEmailNotifications;
          this.email = user.email!;
        })
      )
      .subscribe();

    this.emailChangedSub = this.emailChanged$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((newEmail) => this.updateUser(newEmail, this.enableEmailNotifications!));

    this.enableEmailNotificationsSub = this.enableEmailNotificationsChanged$
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((newValue) => this.updateUser(this.email!, newValue));
  }

  onEmailChange(newValue: string) {
    this.emailChanged$.next(newValue);
  }

  onEmailNotificationsChange(newValue: boolean) {
    this.enableEmailNotificationsChanged$.next(newValue);
  }

  updateUser(email: string, enableEmailNotifications: boolean) {
    const request = { email, enableEmailNotifications } as UpdateUserRequest;

    this.userService.usersUserIdPut(this.user.user_id, request).subscribe({
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
