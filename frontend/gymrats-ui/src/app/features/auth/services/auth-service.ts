import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest, RegisterResponse } from '../models/register';
import { Observable } from 'rxjs/internal/Observable';

@Service()
export class AuthService {
  private http = inject(HttpClient);

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('/api/users', registerRequest);
  }
}