import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { LoginRequest } from '../models/login';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', Validators.required),
  });

  saving = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const loginRequest: LoginRequest = this.form.value as LoginRequest;
    this.authService.login(loginRequest).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(
          error.status === 401 || error.status === 403
            ? 'E-Mail oder Passwort ist falsch.'
            : 'Die Anmeldung ist fehlgeschlagen. Bitte versuche es später erneut.'
        );
      }
    });
  }
}

