import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isAuthEndpoint = req.url.includes('/auth/');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      return from(authService.refresh()).pipe(
        switchMap((newAccessToken) => {
          if (!newAccessToken) {
            return throwError(() => error);
          }
          const retried = req.clone({ setHeaders: { Authorization: `Bearer ${newAccessToken}` } });
          return next(retried);
        }),
      );
    }),
  );
};
