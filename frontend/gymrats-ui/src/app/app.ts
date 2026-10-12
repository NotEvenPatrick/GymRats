import { Component, inject, Signal, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Header } from './layout/header/header';
import { AuthService } from './features/auth/services/auth-service';
import { Observable } from 'rxjs';
import { CurrentUser } from './features/auth/models/current-user';
import { Footer } from './layout/footer/footer';

@Component({
  imports: [RouterOutlet, AsyncPipe, Header, Footer],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title: Signal<string> = signal('gymrats-ui');
  protected readonly currentUser$: Observable<CurrentUser | null> = inject(AuthService).currentUser$;
}
