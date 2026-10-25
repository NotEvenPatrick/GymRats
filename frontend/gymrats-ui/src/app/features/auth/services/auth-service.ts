import { inject, Service, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RegisterRequest, RegisterResponse } from '../models/register';
import { Observable, of, tap, catchError } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { CurrentUser } from '../models/current-user';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private tokenStorageService = inject(TokenStorageService);
  
  private readonly user = signal<CurrentUser | null>(null);
  readonly currentUser = this.user.asReadonly();

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('/api/users', registerRequest);
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', loginRequest).pipe(
      tap((response: LoginResponse) => {
        this.tokenStorageService.saveToken(response.token);
        this.user.set({
          id: response.userId,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
        });
      })
    );
  }

  logout(): void {
    this.tokenStorageService.removeToken();
    this.user.set(null);
  }

  restoreSession(): Observable<CurrentUser | null> {
    const token = this.tokenStorageService.getToken();

    if (!token) {
      return of(null);
    }

    return this.http.get<CurrentUser>('/api/users/me').pipe(
      tap(user => this.user.set(user)),
      catchError((error: HttpErrorResponse) => {
        if(error.status === 401) {
          this.tokenStorageService.removeToken();
          this.user.set(null);
        }
        return of(null);
      })
    );
  }
}
