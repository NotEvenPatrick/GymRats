import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { RegisterRequest, RegisterResponse } from '../models/register';
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const registerRequest: RegisterRequest = this.form.value as RegisterRequest;
    this.authService.register(registerRequest).subscribe({
      next: (response: RegisterResponse) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        switch (error.status) {
          case 400:
            console.error('Bad Request:', error.error);
            break;
          case 401:
            console.error('Unauthorisiert:', error.error);
            break;
          case 409:
            console.error('Conflict: Diese E-Mail-Adresse ist bereits registriert.');
            break;
          default:
            console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
        }
      }
    });
  }
}
