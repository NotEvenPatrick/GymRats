import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Workout } from '../models/workout';
import { WorkoutService } from '../services/workout-service';
import { MuscleGroupLabelPipe } from '../../exercise/pipes/muscle-group-label-pipe';
import { NotificationService } from '../../../core/services/notification-service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { confirmDelete } from '../../../shared/components/confirm-dialog/confirm-delete';

@Component({
  imports: [MatTableModule, MatButtonModule, MatIconModule, MuscleGroupLabelPipe, MatProgressSpinnerModule],
  selector: 'app-workout-list',
  styleUrl: './workout-list.scss',
  templateUrl: './workout-list.html',
})
export class WorkoutList {
  workouts = signal<Workout[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);
  expandedWorkoutId = signal<string | null>(null);
  displayedColumns = ['name', 'description', 'exerciseCount', 'actions'];

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private workoutService = inject(WorkoutService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.loadWorkouts();
  }

  createWorkout(): void {
    this.router.navigate(['/workouts', 'new']);
  }

  editWorkout(workoutId: string): void {
    this.router.navigate(['/workouts', workoutId, 'edit']);
  }

  startSession(workoutId: string): void {
    this.router.navigate(['/sessions', 'start', workoutId]);
  }
  
  deleteWorkout(workoutId: string): void {
    confirmDelete(
      this.dialog,
      'Trainingsplan löschen?',
      'Möchtest du diesen Trainingsplan wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    ).subscribe(() => {
      this.workoutService.delete(workoutId).subscribe({
        next: () => {
          this.notificationService.success('Trainingsplan erfolgreich gelöscht');
          this.loadWorkouts();
        },
        error: () => this.notificationService.error('Fehler beim Löschen des Trainingsplans'),
      });
    });
  }

  toggleExpandedWorkout(workoutId: string): void {
    this.expandedWorkoutId.update(currentId => currentId === workoutId ? null : workoutId);
  }

  private loadWorkouts(): void {
    this.workoutService.getAll().subscribe({
      next: (workouts) => {
        this.workouts.set(workouts);
        this.loadError.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Die Trainingspläne konnten nicht geladen werden.');
        this.loading.set(false);
        this.notificationService.error('Fehler beim Laden der Trainingspläne');
      },
    });
  }
}
