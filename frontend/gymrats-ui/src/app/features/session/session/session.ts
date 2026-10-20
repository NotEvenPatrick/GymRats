import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NotificationService } from '../../../core/services/notification-service';
import { SessionService } from '../services/session-service';
import {
  SessionExercisePreview,
  SessionPreview,
  SessionSetPreview,
} from '../models/session-preview';
import { SessionExerciseStatus } from '../models/status';

type SessionSetForm = FormGroup<{
  setNumber: FormControl<number>;
  weight: FormControl<number | null>;
  reps: FormControl<number | null>;
  completed: FormControl<boolean>;
}>;

type SessionExerciseForm = FormGroup<{
  sourceExerciseId: FormControl<string>;
  position: FormControl<number>;
  plannedSets: FormControl<number>;
  minReps: FormControl<number>;
  maxReps: FormControl<number>;
  status: FormControl<SessionExerciseStatus>;
  sets: FormArray<SessionSetForm>;
}>;

type SessionForm = FormGroup<{
  sessionExercises: FormArray<SessionExerciseForm>;
}>;

@Component({
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-session',
  styleUrl: './session.scss',
  templateUrl: './session.html',
})
export class Session {
  activeSession = signal<SessionPreview | null>(null);
  loading = signal<boolean>(true);

  readonly sessionForm: SessionForm = new FormGroup({
    sessionExercises: new FormArray<SessionExerciseForm>([]),
  });

  private sessionService = inject(SessionService);
  private activatedRoute = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  constructor() {
    this.loadSessionPreview();
  }

  get sessionExercises(): FormArray<SessionExerciseForm> {
    return this.sessionForm.controls.sessionExercises;
  }

  getSets(exerciseIndex: number): FormArray<SessionSetForm> {
    return this.sessionExercises.at(exerciseIndex).controls.sets;
  }

  private loadSessionPreview(): void {
    const workoutId = this.activatedRoute.snapshot.paramMap.get('workoutId');

    if (!workoutId) {
      this.notificationService.error('Fehler beim Laden des Trainings');
      this.loading.set(false);
      return;
    }

    this.sessionService.prepareSession(workoutId).subscribe({
      next: (sessionPreview) => {
        this.activeSession.set(sessionPreview);
        this.initializeForm(sessionPreview);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load session preview', error);
        this.notificationService.error('Fehler beim Starten des Trainings');
        this.loading.set(false);
      },
    });
  }

  private initializeForm(session: SessionPreview): void {
    this.sessionExercises.clear();

    for (const exercise of session.sessionExercises) {
      this.sessionExercises.push(this.createExerciseForm(exercise));
    }
  }

  private createExerciseForm(
    exercise: SessionExercisePreview,
  ): SessionExerciseForm {
    return new FormGroup({
      sourceExerciseId: new FormControl(exercise.sourceExerciseId, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      position: new FormControl(exercise.position, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      plannedSets: new FormControl(exercise.plannedSets, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      minReps: new FormControl(exercise.minReps, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      maxReps: new FormControl(exercise.maxReps, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      status: new FormControl(exercise.status, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      sets: new FormArray<SessionSetForm>(
        exercise.sets.map((set) => this.createSetForm(set)),
      ),
    });
  }

  private createSetForm(set: SessionSetPreview): SessionSetForm {
    return new FormGroup({
      setNumber: new FormControl(set.setNumber, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      weight: new FormControl<number | null>(set.weight, {
        validators: [Validators.min(0)],
      }),
      reps: new FormControl<number | null>(set.reps, {
        validators: [Validators.min(1)],
      }),
      completed: new FormControl(set.completed, {
        nonNullable: true,
      }),
    });
  }

  addSet(exerciseIndex: number): void {
    const sets = this.getSets(exerciseIndex);

    sets.push(
      this.createSetForm({
        setNumber: sets.length + 1,
        weight: null,
        reps: null,
        completed: false,
      }),
    );
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    const sets = this.getSets(exerciseIndex);

    sets.removeAt(setIndex);

    sets.controls.forEach((set, index) => {
      set.controls.setNumber.setValue(index + 1);
    });
  }
}
