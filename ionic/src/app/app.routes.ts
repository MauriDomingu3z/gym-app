import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'exercises', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'exercises',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/exercises/exercise-catalog/exercise-catalog.page').then((m) => m.ExerciseCatalogPage),
  },
  {
    path: 'exercises/:slug',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/exercises/exercise-detail/exercise-detail.page').then((m) => m.ExerciseDetailPage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () => import('./features/favorites/favorites.page').then((m) => m.FavoritesPage),
  },
];
