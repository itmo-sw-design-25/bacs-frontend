import { first, map } from 'rxjs';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CurrentUserService } from '@shared/services/current-user.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const currentUser = inject(CurrentUserService);
  const router = inject(Router);

  const allowed = route.data['roles'] as string[] | undefined;

  if (!allowed || allowed.length === 0) {
    return true;
  }

  if (allowed.includes('bacs-super-admin') && currentUser.isSuperAdmin) {
    return true;
  }

  if (allowed.includes('admin')) {
    return currentUser.user$.pipe(
      first(),
      map(user => user.adminIn && user.adminIn?.length > 0 ? true : router.createUrlTree(['/']))
    );
  }

  return router.createUrlTree(['/']);
};
