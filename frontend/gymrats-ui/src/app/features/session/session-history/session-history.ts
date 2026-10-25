import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { SessionSummary } from '../models/session-summary';
import { SessionStatusLabelPipe } from '../pipes/session-status-label-pipe';
import { SessionService } from '../services/session-service';

@Component({
  imports: [DatePipe, SessionStatusLabelPipe, MatCardModule, MatProgressSpinnerModule, RouterLink],
  selector: 'app-session-history',
  styleUrl: './session-history.scss',
  templateUrl: './session-history.html',
})
export class SessionHistory {
  sessions = signal<SessionSummary[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private sessionService = inject(SessionService);



  constructor() {
    this.loadSessionHistory();
  }

  private loadSessionHistory() {
    this.sessionService.getHistory().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load session history', err);
        this.error.set('Die Trainingshistorie konnte nicht geladen werden.');
        this.loading.set(false);
      }
    });
  }


}
