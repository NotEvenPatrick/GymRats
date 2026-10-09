import { inject, Service } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RegisterRequest, RegisterResponse } from '../models/register';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { CurrentUser } from '../models/current-user';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private tokenStorageService = inject(TokenStorageService);
  
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('/api/users', registerRequest);
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', loginRequest).pipe(
      tap((response: LoginResponse) => {
        this.tokenStorageService.saveToken(response.token);
        this.currentUserSubject.next({
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
    this.currentUserSubject.next(null);
  }

  restoreSession(): Observable<CurrentUser | null> {
    const token = this.tokenStorageService.getToken();

    if (!token) {
      return of(null);
    }

    return this.http.get<CurrentUser>('/api/users/me').pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError((error: HttpErrorResponse) => {
        if(error.status === 401) {
          this.tokenStorageService.removeToken();
          this.currentUserSubject.next(null);
        }
        return of(null);
      })
    );
  }
}
