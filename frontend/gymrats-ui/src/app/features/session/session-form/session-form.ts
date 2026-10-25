import { Component, inject, signal } from '@angular/core';
import { SessionService } from '../services/session-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionPreview, SessionSetPreview } from '../models/session-preview';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SessionRequest } from '../models/session-request';
import { buildSessionRequest } from '../mappers/session-request-mapper';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from '../../../shared/components/confirm-dialog/confirm-dialog';

type SessionSetForm = FormGroup<{
  weight: FormControl<number | null>;
  reps: FormControl<number | null>;
}>;

type SessionFormGroup = FormGroup<{
  sessionExercises: FormArray<FormArray<SessionSetForm>>
}>

function weightRequiredWithReps(set: AbstractControl): ValidationErrors | null {
  const { weight, reps } = (set as SessionSetForm).controls;

  return reps.value !== null && weight.value === null ? { weightMissing: true } : null;
}

@Component({
  imports: [MatProgressSpinnerModule, MatCardModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  selector: 'app-session-form',
  styleUrl: './session-form.scss',
  templateUrl: './session-form.html',
})
export class SessionForm {
  activeSession = signal<SessionPreview | null>(null);
  loading = signal<boolean>(true);
  loadError = signal<string | null>(null);
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
    return this.saving() || this.savedSessionId() !== null || this.filledSetCount === 0;
  }

  get isDiscardDisabled(): boolean {
    return this.saving() || this.savedSessionId() !== null;
  }

  get filledSetCount(): number {
    return this.allSets().filter((set) => this.isSetFilled(set)).length;
  }

  get totalSetCount(): number {
    return this.allSets().length;
  }

  finishSession(): void {
    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, {
      data: {
        title: 'Training beenden?',
        message: `${this.filledSetCount} von ${this.totalSetCount} Sätzen sind ausgefüllt. Nicht ausgefüllte Sätze werden nicht gespeichert.`,
        cancelButtonText: 'Weiter trainieren',
        confirmButtonText: 'Beenden und speichern',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.saveSession();
      }
    });
  }

  discardSession(): void {
    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, {
      data: {
        title: 'Training verwerfen?',
        message: 'Deine Eingaben werden nicht gespeichert.',
        cancelButtonText: 'Weiter trainieren',
        confirmButtonText: 'Verwerfen',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.navigateToWorkouts();
      }
    });
  }

  navigateToWorkouts(): void {
    this.router.navigate(['/workouts']);
  }

  private allSets(): SessionSetForm[] {
    return this.sessionForm.controls.sessionExercises.controls.flatMap((exerciseSets) => exerciseSets.controls);
  }

  private isSetFilled(set: SessionSetForm): boolean {
    const { weight, reps } = set.controls;

    return weight.value !== null && reps.value !== null && weight.valid && reps.valid;
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
    return new FormGroup(
      {
        weight: new FormControl<number | null>(set.weight, Validators.min(0)),
        reps: new FormControl<number | null>(set.reps, [Validators.min(1), Validators.pattern(/^\d+$/)]),
      },
      weightRequiredWithReps,
    );
  }

  private loadActiveSession(): void {
    if (!this.workoutId) {
      this.loadError.set('Ungültige Trainingsplan-ID.');
      this.loading.set(false);
      return;
    }

    this.sessionService.prepareSession(this.workoutId).subscribe({
      next: (session) => {
        this.activeSession.set(session);
        this.initializeForm(session);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load session', err);
        this.loadError.set('Das Training konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  private createSessionRequest(): SessionRequest {
    const preview = this.activeSession();

    if (!preview) {
      throw new Error('No active session loaded.');
    }

    const setValues = this.sessionForm.controls.sessionExercises.controls.map((sets) => sets.getRawValue());

    return buildSessionRequest(preview, setValues);
  }

  private saveSession(): void {
    if (this.saving() || this.savedSessionId()) {
      return;
    }

    this.sessionForm.markAllAsTouched();
    if (this.sessionForm.invalid) {
      this.saveError.set('Bitte überprüfe deine Eingaben.');
      return;
    }

    if (this.filledSetCount === 0) {
      this.saveError.set('Bitte fülle mindestens einen Satz aus.');
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    const request = this.createSessionRequest();

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
