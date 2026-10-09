import { Component, inject } from '@angular/core';
import { ExerciseService } from '../services/exercise-service';
import { AsyncPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseForm } from '../exercise-form/exercise-form';

@Component({
  imports: [AsyncPipe],
  selector: 'app-exercise-list',
  styleUrl: './exercise-list.scss',
  templateUrl: './exercise-list.html',
})
export class ExerciseList {
  private exerciseService = inject(ExerciseService);
  exercises$ = this.exerciseService.getAll();

  private dialog = inject(MatDialog);

  openExerciseDialog() {
    this.dialog.open(ExerciseForm, {
      data: { exercise: null }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.exercises$ = this.exerciseService.getAll();
      }
    });
  }
}
