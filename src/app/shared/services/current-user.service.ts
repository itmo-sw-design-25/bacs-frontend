import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, switchMap } from 'rxjs';
import { UserDto } from '@api/models/userDto';
import { UsersService } from '@api/services/users.service';
import { AuthService } from '@core/auth.service';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  readonly user$: Observable<UserDto> = this.authService.authSuccess$.pipe(
    switchMap(() => this.usersService.usersUserIdGet(this.authService.user?.user_id!)),
    shareReplay(1)
  );

  isAdmin(locationId?: string) {
    return !locationId
      ? this.user$.pipe(map((user) => this.isSuperAdmin || this.isLocationAdmin(user)))
      : this.user$.pipe(
          map((user) => this.isSuperAdmin || this.isCurrentLocationAdmin(locationId, user))
        );
  }

  get isSuperAdmin() {
    return this.authService.isSuperAdmin;
  }

  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  private isLocationAdmin(user: UserDto) {
    return user.adminIn && user.adminIn.length > 0;
  }

  private isCurrentLocationAdmin(locationId: string, user: UserDto) {
    return this.isLocationAdmin(user) && user.adminIn!.includes(locationId);
  }
}
