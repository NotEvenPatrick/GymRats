import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { RegisterRequest } from '../models/register';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {

  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = new FormGroup({
    firstName: new FormControl<string>('', Validators.required),
    lastName: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('', [ Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
  });

  saving = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const registerRequest: RegisterRequest = this.form.value as RegisterRequest;
    this.authService.register(registerRequest).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        switch (error.status) {
          case 400:
            this.errorMessage.set('Bitte überprüfe deine Eingaben.');
            break;
          case 409:
            this.errorMessage.set('Diese E-Mail-Adresse ist bereits registriert.');
            break;
          default:
            this.errorMessage.set('Die Registrierung ist fehlgeschlagen. Bitte versuche es später erneut.');
        }
      }
    });
  }
}
