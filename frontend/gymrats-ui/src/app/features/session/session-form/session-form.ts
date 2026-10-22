import { Component, inject, signal } from '@angular/core';
import { SessionService } from '../services/session-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionPreview, SessionSetPreview } from '../models/session-preview';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SessionExerciseRequest, SessionRequest, SessionSetRequest } from '../models/session-request';
import { SessionStatus } from '../models/status';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from '../../../shared/components/confirm-dialog/confirm-dialog';

type SessionSetForm = FormGroup<{
  weight: FormControl<number>;
  reps: FormControl<number | null>;
}>;

type SessionFormGroup = FormGroup<{
  sessionExercises: FormArray<FormArray<SessionSetForm>>
}>

@Component({
  imports: [MatProgressSpinnerModule, MatCardModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  selector: 'app-session-form',
  styleUrl: './session-form.scss',
  templateUrl: './session-form.html',
})
export class SessionForm {
  activeSession = signal<SessionPreview | null>(null);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  saveError = signal<string | null>(null);
  savedSessionId = signal<string | null>(null);

  sessionForm: SessionFormGroup = new FormGroup({
    sessionExercises: new FormArray<FormArray<SessionSetForm>>([])
  });


  private sessionService = inject(SessionService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  workoutId = this.activatedRoute.snapshot.paramMap.get('workoutId');


  constructor() {
    this.loadActiveSession();
  }

  get isFinishDisabled(): boolean {
    return this.saving() || this.savedSessionId() !== null || !this.areAllSetsFilled();
  }

  get isCancelDisabled(): boolean {
    return this.saving() || this.savedSessionId() !== null;
  }

  finishSession(): void {
    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, {
      data: {
        title: 'Training beenden?',
        message: 'Möchtest du deine Trainingseinheit abschließen?',
        cancelButtonText: 'Abbrechen',
        confirmButtonText: 'Beenden',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.saveSession(SessionStatus.COMPLETED);
      }
    });
  }

  cancelSession(): void {
    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, {
      data: {
        title: 'Training abbrechen?',
        message:
          'Möchtest du deine bisherige Trainingseinheit speichern oder verwerfen? Nicht abgeschlossene Sätze werden nicht gespeichert.',
        cancelButtonText: 'Weiter trainieren',
        confirmButtonText: 'Abbrechen und speichern',
        discardButtonText: 'Abbrechen und verwerfen',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.saveSession(SessionStatus.CANCELLED);
      } else if (result === 'discard') {
        this.router.navigate(['/workouts']);
      }
    });
  }

  navigateToWorkouts(): void {
    this.router.navigate(['/workouts']);
  }

  areAllSetsFilled(): boolean {
    const exerciseFormArrays =
      this.sessionForm.controls.sessionExercises.controls;

    if (exerciseFormArrays.length === 0) {
      return false;
    }

    return exerciseFormArrays.every((exerciseSets) =>
      exerciseSets.controls.length > 0 && exerciseSets.controls.every((set) => {
        const reps = set.controls.reps.value;

        return reps !== null && set.controls.reps.valid;
      })
    );
  }

  private initializeForm(session: SessionPreview): void {
    this.sessionForm.setControl(
      'sessionExercises',
      new FormArray<FormArray<SessionSetForm>>(
        session.sessionExercises.map(
          (exercise) =>
            new FormArray<SessionSetForm>(
              exercise.sets.map((set) => this.createSetForm(set)),
            ),
        ),
      ),
    );
  }

  private createSetForm(set: SessionSetPreview): SessionSetForm {
    return new FormGroup({
      weight: new FormControl<number>(set.weight, { nonNullable: true }),
      reps: new FormControl<number | null>(set.reps)
    });
  }

  private loadActiveSession(): void {
    if (this.workoutId) {
      this.sessionService.prepareSession(this.workoutId).subscribe({
        next: (session) => {
          this.activeSession.set(session);
          this.initializeForm(session);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load session', err);
          this.loading.set(false);
        },
      });
    }
  }

  private createSessionRequest(status: SessionStatus): SessionRequest {
    const preview = this.activeSession();

    if (!preview) {
      throw new Error('No active session loaded.');
    }

    const exerciseFormArrays =
      this.sessionForm.controls.sessionExercises.controls;

    const sessionExercises: SessionExerciseRequest[] =
      preview.sessionExercises.map((previewExercise, exerciseIndex) => {
        const setFormArray = exerciseFormArrays[exerciseIndex];
        const formSets = setFormArray.getRawValue();
        const sets: SessionSetRequest[] = [];

        formSets.forEach((set) => {
          if (set.weight === null || set.reps === null) {
            return;
          }

          sets.push({
            setNumber: sets.length + 1,
            weight: set.weight,
            reps: set.reps,
          });
        });

        return {
          sourceExerciseId: previewExercise.sourceExerciseId,
          position: previewExercise.position,
          plannedSets: previewExercise.plannedSets,
          minReps: previewExercise.minReps,
          maxReps: previewExercise.maxReps,
          sets,
        };
      });

    return {
      sourceWorkoutId: preview.sourceWorkoutId,
      startedAt: preview.startedAt,
      status,
      sessionExercises,
    };
  }

  private saveSession(status: SessionStatus): void {
    if (this.saving() || this.savedSessionId()) {
      return;
    }

    this.sessionForm.markAllAsTouched();
    if (this.sessionForm.invalid) {
      this.saveError.set('Bitte überprüfe deine Eingaben.');
      return;
    }

    if (status === SessionStatus.COMPLETED && !this.areAllSetsFilled()) {
      this.saveError.set('Bitte fülle alle Sätze aus, bevor du das Training beendest.');
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    const request = this.createSessionRequest(status);

    this.sessionService.create(request).subscribe({

      next: (response) => {
        this.savedSessionId.set(response.id);
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Failed to save session', err);
        this.saveError.set('Fehler beim Speichern der Session.');
        this.saving.set(false);
      }
    });
  }
}
