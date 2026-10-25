import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification-service';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn, Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ExerciseService } from '../../exercise/services/exercise-service';
import { Exercise } from '../../exercise/models/exercise';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CdkDrag, CdkDragHandle, CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { WorkoutService } from '../services/workout-service';
import { buildWorkoutRequest } from '../mappers/workout-request-mapper';

type ExerciseRowForm = FormGroup<{
  exerciseId: FormControl<string | null>;
  exerciseSearch: FormControl<string | Exercise>;
  plannedSets: FormControl<number | null>;
  minReps: FormControl<number | null>;
  maxReps: FormControl<number | null>;
}>;

class TouchedErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null): boolean {
    return !!control && control.invalid && control.touched;
  }
}

@Component({
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: TouchedErrorStateMatcher }
  ],
  selector: 'app-workout-form',
  styleUrl: './workout-form.scss',
  templateUrl: './workout-form.html',
})
export class WorkoutForm {
  form = new FormGroup({
    name: new FormControl('', { validators: Validators.required, nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    exercises: new FormArray<ExerciseRowForm>([], Validators.required)
  });

  exercises = signal<Exercise[]>([]);
  saving = signal(false);

  protected workoutId: string | null = null;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutService);
  private notificationService = inject(NotificationService);

  get exerciseRows(): FormArray<ExerciseRowForm> {
    return this.form.controls.exercises;
  }

  constructor() {
    this.loadExercises();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.workoutId = id;
      this.loadWorkout(id);
    }
  }

  addExerciseRow(): void {
    this.exerciseRows.push(this.createExerciseRow());
  }

  removeExerciseRow(index: number): void {
    this.exerciseRows.removeAt(index);
  }

  drop(event: CdkDragDrop<ExerciseRowForm[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const row = this.exerciseRows.at(event.previousIndex);

    this.exerciseRows.removeAt(event.previousIndex, { emitEvent: false });
    this.exerciseRows.insert(event.currentIndex, row, { emitEvent: false });

    this.exerciseRows.updateValueAndValidity();
    this.exerciseRows.markAsDirty();
  }

  getFilteredExercises(row: ExerciseRowForm): Exercise[] {
    const value = row.controls.exerciseSearch.value;
    const searchTerm = typeof value === 'string' ? value.toLowerCase() : '';

    return this.exercises().filter(exercise => exercise.name.toLowerCase().includes(searchTerm));
  }

  displayExercise(value: string | Exercise): string {
    if (!value) {
      return '';
    }

    return typeof value === 'string' ? value : value.name;
  }

  onExerciseSelected(row: ExerciseRowForm, exercise: Exercise): void {
    row.controls.exerciseId.setValue(exercise.id);
  }

  onExerciseSearchInput(row: ExerciseRowForm): void {
    row.controls.exerciseId.setValue(null);
    row.controls.exerciseSearch.markAsUntouched();
  }

  cancel(): void {
    this.router.navigate(['/workouts']);
  }

  onSubmit(): void {
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = buildWorkoutRequest(
      this.form.getRawValue(),
      this.exerciseRows.controls.map((row) => row.getRawValue()),
    );

    if (!request) {
      this.form.markAllAsTouched();
      return;
    }

    const request$ = this.workoutId
      ? this.workoutService.update(this.workoutId, request)
      : this.workoutService.create(request);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.notificationService.success('Trainingsplan erfolgreich gespeichert.');
        this.router.navigate(['/workouts']);
      },
      error: () => {
        this.saving.set(false);
        this.notificationService.error('Fehler beim Speichern des Trainingsplans.');
      }
    });
  }

  private loadExercises(): void {
    this.exerciseService.getAll().subscribe({
      next: (exercises) => this.exercises.set(exercises),
      error: () => this.notificationService.error('Fehler beim Laden der Übungen.')
    });
  }

  private loadWorkout(id: string): void {
    this.workoutService.getById(id).subscribe({
      next: (workout) => {
        this.form.patchValue({
          name: workout.name,
          description: workout.description ?? ''
        });

        this.exerciseRows.clear();

        for (const exercise of workout.exercises) {
          this.addExerciseRow();

          const row = this.exerciseRows.at(this.exerciseRows.length - 1);

          row.patchValue({
            exerciseId: exercise.exerciseId,
            exerciseSearch: exercise.exerciseName,
            plannedSets: exercise.plannedSets,
            minReps: exercise.minReps,
            maxReps: exercise.maxReps,
          });
        }
      },
      error: () => {
        this.notificationService.error('Fehler beim Laden des Workouts.');
        this.router.navigate(['/workouts']);
      }
    });
  }

  private createExerciseRow(): ExerciseRowForm {
    return new FormGroup({
      exerciseId: new FormControl<string | null>(null, Validators.required),
      exerciseSearch: new FormControl<string | Exercise>('', { nonNullable: true }),
      plannedSets: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      minReps: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      maxReps: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    }, { validators: this.repetitionRangeValidator });
  }

  private repetitionRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const minReps = control.get('minReps')?.value;
    const maxReps = control.get('maxReps')?.value;

    if (minReps == null || maxReps == null) {
      return null;
    }

    return minReps > maxReps ? { invalidRepetitionRange: true } : null;
  };
}
