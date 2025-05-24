import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/locations/locations-list/locations-list.component').then((m) => m.LocationsListComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search-page.component').then((m) => m.SearchPageComponent)
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('./features/reservations/my-reservations-page.component').then((m) => m.MyReservationsPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    canActivate: [roleGuard]
  }
];
