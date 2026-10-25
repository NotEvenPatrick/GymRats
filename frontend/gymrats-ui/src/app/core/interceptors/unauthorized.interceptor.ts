import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth-service';
import { TokenStorageService } from '../services/token-storage.service';

// restoreSession() behandelt ein 401 auf /api/users/me selbst, ein 401 beim Login heißt "falsche Zugangsdaten".
const EXCLUDED_URLS = ['/api/auth/login', '/api/users/me'];

export const unauthorizedInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const tokenStorageService = inject(TokenStorageService);

  const hadToken = tokenStorageService.getToken() !== null;

  return next(request).pipe(
    catchError((error: unknown) => {
      const isExcluded = EXCLUDED_URLS.some((url) => request.url.startsWith(url));

      if (error instanceof HttpErrorResponse && error.status === 401 && hadToken && !isExcluded) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
