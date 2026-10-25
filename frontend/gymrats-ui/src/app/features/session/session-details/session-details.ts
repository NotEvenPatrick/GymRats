import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Session } from '../models/session';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionService } from '../services/session-service';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MuscleGroupLabelPipe } from '../../exercise/pipes/muscle-group-label-pipe';

@Component({
  imports: [MatCardModule, MatProgressSpinnerModule, DatePipe, RouterLink, MatButtonModule, MuscleGroupLabelPipe],
  selector: 'app-session-details',
  styleUrl: './session-details.scss',
  templateUrl: './session-details.html',
})
export class SessionDetails {
  session = signal<Session | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private sessionService = inject(SessionService);
  private activatedRoute = inject(ActivatedRoute);
  private sessionId = this.activatedRoute.snapshot.paramMap.get('id');

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    if (!this.sessionId) {
      this.error.set('Ungültige Session-ID.');
      this.loading.set(false);
      return;
    }

    this.sessionService.getById(this.sessionId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load session:', err);
        this.error.set('Die Trainingsdetails konnten nicht geladen werden.');
        this.loading.set(false);
      }
    });
  }
}
