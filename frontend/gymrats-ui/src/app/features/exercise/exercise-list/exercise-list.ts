import { Component, inject, signal } from '@angular/core';
import { ExerciseService } from '../services/exercise-service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ExerciseForm } from '../exercise-form/exercise-form';
import { Exercise } from '../models/exercise';
import { MuscleGroupLabelPipe } from '../pipes/muscle-group-label-pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { confirmDelete } from '../../../shared/components/confirm-dialog/confirm-delete';
import { NotificationService } from '../../../core/services/notification-service';

@Component({
  imports: [MatTableModule, MatButtonModule, MuscleGroupLabelPipe, MatProgressSpinnerModule],
  selector: 'app-exercise-list',
  styleUrl: './exercise-list.scss',
  templateUrl: './exercise-list.html',
})
export class ExerciseList {
  exercises = signal<Exercise[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);
  displayedColumns = ['name', 'muscleGroup', 'description', 'actions'];
  
  private exerciseService = inject(ExerciseService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  constructor() {
    this.loadExercises();
  }

  openExerciseDialog(exercise: Exercise | null = null): void {
    this.dialog.open(ExerciseForm, {
      data: { exercise: exercise }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadExercises();
      }
    });
  }

  deleteExercise(exerciseId: string): void {
    confirmDelete(this.dialog, 'Löschen bestätigen', 'Sind Sie sicher, dass Sie diese Übung löschen möchten?').subscribe(() => {
      this.exerciseService.delete(exerciseId).subscribe({
        next: () => {
          this.notificationService.success('Übung erfolgreich gelöscht');
          this.loadExercises();
        },
        error: () => {
          this.notificationService.error('Fehler beim Löschen der Übung');
        }
      });
    });
  }

  private loadExercises(): void {
    this.exerciseService.getAll().subscribe({
      next: exercises => {
        this.exercises.set(exercises);
        this.loadError.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Die Übungen konnten nicht geladen werden.');
        this.loading.set(false);
        this.notificationService.error('Fehler beim Laden der Übungen');
      }
    });
  }
}
