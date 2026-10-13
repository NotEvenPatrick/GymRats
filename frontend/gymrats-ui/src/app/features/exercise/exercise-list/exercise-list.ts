import { Component, inject, signal } from '@angular/core';
import { ExerciseService } from '../services/exercise-service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ExerciseForm } from '../exercise-form/exercise-form';
import { Exercise } from '../models/exercise';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { NotificationService } from '../../../core/services/notification-service';

@Component({
  imports: [MatTableModule, MatButtonModule],
  selector: 'app-exercise-list',
  styleUrl: './exercise-list.scss',
  templateUrl: './exercise-list.html',
})
export class ExerciseList {
  exercises = signal<Exercise[]>([]);
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
    this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Löschen bestätigen',
        message: 'Sind Sie sicher, dass Sie diese Übung löschen möchten?',
        confirmButtonText: 'Löschen',
        cancelButtonText: 'Abbrechen'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.exerciseService.delete(exerciseId).subscribe({
          next: () => { 
            this.notificationService.success('Übung erfolgreich gelöscht'); 
            this.loadExercises();
          },
          error: () => {
            this.notificationService.error('Fehler beim Löschen der Übung');
          }
        });
      }
    });
  }

  private loadExercises(): void {
    this.exerciseService.getAll().subscribe({
      next: exercises => this.exercises.set(exercises),
      error: () => this.notificationService.error('Fehler beim Laden der Übungen')
    });
  }
}
