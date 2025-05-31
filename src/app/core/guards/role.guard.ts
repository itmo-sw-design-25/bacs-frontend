import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed = route.data['roles'] as string[] | undefined;
  if (!allowed || allowed.length === 0) return true;

  if (allowed.includes('bacs-super-admin') && auth.isSuperAdmin) return true;
  if (allowed.includes('admin') && auth.isAdmin) return true;

  router.navigate(['/']);

  return false;
};
