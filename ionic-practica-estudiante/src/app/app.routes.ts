import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/register/register.page').then((m) => m.RegisterPage),
  },
];
