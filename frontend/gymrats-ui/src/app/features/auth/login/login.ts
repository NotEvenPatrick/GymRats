import { Component, inject } from '@angular/core';
import { FormGroup, FormControl,ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { LoginRequest, LoginResponse } from '../models/login';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {

  private authService = inject(AuthService);
  form: FormGroup = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', Validators.required),
  });

  onSubmit(): void {
    if (this.form.valid) {
      const loginRequest: LoginRequest = this.form.value as LoginRequest;
      this.authService.login(loginRequest).subscribe({
        next: (response: LoginResponse) => {
          // Handle successful login
        },
        error: (error: HttpErrorResponse) => {
          // Handle login error
        }
      });
    }
  }
}
