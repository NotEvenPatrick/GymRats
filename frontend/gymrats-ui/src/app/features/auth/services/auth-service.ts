import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest, RegisterResponse } from '../models/register';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('/api/users', registerRequest);
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', loginRequest).pipe(
      tap((response: LoginResponse) => {
        this.currentUserSubject.next(response);
      })
    );
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }
}