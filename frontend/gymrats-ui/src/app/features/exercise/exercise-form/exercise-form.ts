import { Component, inject } from '@angular/core';
import { ExerciseService } from '../services/exercise-service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Exercise } from '../models/exercise';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MUSCLE_GROUPS, MuscleGroup } from '../models/muscle-group';
import { ExerciseRequest } from '../models/exercise-request';

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule], 
  selector: 'app-exercise-form',
  styleUrl: './exercise-form.scss',
  templateUrl: './exercise-form.html',
})
export class ExerciseForm {
  private exerciseService = inject(ExerciseService);

  private dialogRef = inject(MatDialogRef<ExerciseForm>);
  private data = inject<{ exercise: Exercise | null }>(MAT_DIALOG_DATA);

  exerciseForm = new FormGroup({
    name: new FormControl<string>(this.data.exercise?.name ?? '', {nonNullable: true, validators: Validators.required}),
    muscleGroup: new FormControl<MuscleGroup | null>(this.data.exercise?.muscleGroup ?? null, Validators.required),
    description: new FormControl<string>(this.data.exercise?.description ?? '', {nonNullable: true}),
  });

  muscleGroups = MUSCLE_GROUPS;
  
  protected get isEditMode(): boolean {
    return this.data.exercise !== null;
  }

  onSubmit() {
    if (this.exerciseForm.invalid) {
      this.exerciseForm.markAllAsTouched();
      return;
    }

    const { name, muscleGroup, description } = this.exerciseForm.getRawValue();
    if (!muscleGroup) {
      return;
    }
    const exercise: ExerciseRequest = {
      name: name.trim(),
      muscleGroup: muscleGroup,
      description: description.trim(),
    };

    const existingExercise = this.data.exercise;
  
    const request$ = existingExercise
      ? this.exerciseService.update(existingExercise.id, exercise)
      : this.exerciseService.create(exercise);

    request$.subscribe(() => this.dialogRef.close(true));
  }
}
