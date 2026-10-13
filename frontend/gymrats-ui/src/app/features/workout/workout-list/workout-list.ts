import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Workout } from '../models/workout';
import { WorkoutService } from '../services/workout-service';
import { NotificationService } from '../../../core/services/notification-service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  selector: 'app-workout-list',
  styleUrl: './workout-list.scss',
  templateUrl: './workout-list.html',
})
export class WorkoutList {
  workouts = signal<Workout[]>([]);
  expandedWorkoutId = signal<string | null>(null);
  displayedColumns = ['name', 'description', 'exerciseCount', 'actions'];

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private workoutService = inject(WorkoutService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.loadWorkouts();
  }

  editWorkout(workoutId: string): void {
    this.router.navigate(['/workouts', workoutId, 'edit']);
  }

  deleteWorkout(workoutId: string): void {
    this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Trainingsplan löschen?',
        message: 'Möchtest du diesen Trainingsplan wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        confirmButtonText: 'Löschen',
        cancelButtonText: 'Abbrechen'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.workoutService.delete(workoutId).subscribe({
          next: () => {
            this.notificationService.success('Trainingsplan erfolgreich gelöscht');
            this.loadWorkouts();
          },
          error: () => this.notificationService.error('Fehler beim Löschen des Trainingsplans'),
        });
      }
    });
  }

  toggleExpandedWorkout(workoutId: string): void {
    this.expandedWorkoutId.update(currentId => currentId === workoutId ? null : workoutId);
  }

  private loadWorkouts(): void {
    this.workoutService.getAll().subscribe({
      next: (workouts) => this.workouts.set(workouts),
      error: () => this.notificationService.error('Fehler beim Laden der Trainingspläne'),
    });
  }
}
