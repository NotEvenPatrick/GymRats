import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { RegisterRequest, RegisterResponse } from '../models/register';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {

  form: FormGroup = new FormGroup({
    firstName: new FormControl<string>('', Validators.required),
    lastName: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('', [ Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
  });

  constructor(private authService: AuthService) {  }

  onSubmit() {
    if (this.form.valid) {
      const registerRequest: RegisterRequest = this.form.value as RegisterRequest;
      this.authService.register(registerRequest).subscribe({
        next: (response: RegisterResponse) => {
          console.log('Registration successful:', response);
        },
        error: (error: any) => {
          console.error('Registration failed:', error);
        }
      });
    }
  }
}
