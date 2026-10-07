import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth-service';
import { AsyncPipe } from '@angular/common';

@Component({
  imports: [RouterOutlet, AsyncPipe],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('gymrats-ui');
  private authService = inject(AuthService);
  private router = inject(Router); 

  public onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
