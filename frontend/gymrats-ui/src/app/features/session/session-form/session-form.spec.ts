import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { SessionForm } from './session-form';
import { SessionService } from '../services/session-service';
import { SessionPreview } from '../models/session-preview';
import { Session } from '../models/session';

describe('SessionForm', () => {
  let component: SessionForm;
  let fixture: ComponentFixture<SessionForm>;

  const preview: SessionPreview = {
    sourceWorkoutId: 'workout-1',
    workoutName: 'Push Day',
    startedAt: '2026-01-01T10:00:00Z',
    sessionExercises: [
      {
        sourceExerciseId: 'exercise-1',
        exerciseName: 'Bankdrücken',
        muscleGroup: 'CHEST',
        position: 1,
        plannedSets: 2,
        minReps: 6,
        maxReps: 10,
        sets: [
          { setNumber: 1, weight: 60, reps: null },
          { setNumber: 2, weight: 60, reps: null },
        ],
      },
      {
        sourceExerciseId: 'exercise-2',
        exerciseName: 'Schulterdrücken',
        muscleGroup: 'SHOULDERS',
        position: 2,
        plannedSets: 1,
        minReps: 8,
        maxReps: 12,
        sets: [{ setNumber: 1, weight: 30, reps: null }],
      },
    ],
  } as SessionPreview;

  const savedSession = { id: 'session-1' } as Session;

  const sessionServiceMock = {
    prepareSession: vi.fn(),
    create: vi.fn(),
  };
  const routerMock = { navigate: vi.fn().mockResolvedValue(true) };
  const dialogMock = { open: vi.fn() };

  function setDialogResult(result: boolean | undefined): void {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(result) });
  }

  function setValues(exerciseIndex: number, setIndex: number, value: { weight?: number | null; reps?: number | null }): void {
    component.sessionForm.controls.sessionExercises.at(exerciseIndex).at(setIndex).patchValue(value);
  }

  async function createComponent(workoutId: string | null = 'workout-1'): Promise<void> {
    const paramMap = convertToParamMap(workoutId ? { workoutId } : {});
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { paramMap } } });

    fixture = TestBed.createComponent(SessionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    sessionServiceMock.prepareSession.mockReturnValue(of(preview));
    sessionServiceMock.create.mockReturnValue(of(savedSession));
    setDialogResult(true);

    await TestBed.configureTestingModule({
      imports: [SessionForm],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();
  });

  describe('Laden', () => {
    it('zeigt einen Fehler und lädt nichts, wenn die Workout-ID fehlt', async () => {
      await createComponent(null);

      expect(sessionServiceMock.prepareSession).not.toHaveBeenCalled();
      expect(component.loadError()).toBe('Ungültige Trainingsplan-ID.');
      expect(component.loading()).toBe(false);
    });

    it('baut das Formular aus der Vorschau mit allen Sätzen auf', async () => {
      await createComponent();

      expect(sessionServiceMock.prepareSession).toHaveBeenCalledWith('workout-1');
      expect(component.activeSession()).toEqual(preview);
      expect(component.loading()).toBe(false);
      expect(component.totalSetCount).toBe(3);
      expect(component.sessionForm.controls.sessionExercises.length).toBe(2);
    });

    it('setzt eine Fehlermeldung, wenn das Laden fehlschlägt', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      sessionServiceMock.prepareSession.mockReturnValue(throwError(() => new Error('boom')));

      await createComponent();

      expect(component.loadError()).toBe('Das Training konnte nicht geladen werden.');
      expect(component.activeSession()).toBeNull();
      expect(component.loading()).toBe(false);
    });
  });

  describe('ausgefüllte Sätze', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('zählt einen Satz erst als ausgefüllt, wenn Gewicht und Wiederholungen vorhanden sind', () => {
      expect(component.filledSetCount).toBe(0);

      setValues(0, 0, { reps: 8 });

      expect(component.filledSetCount).toBe(1);
    });

    it('akzeptiert Gewicht 0 als gültigen Wert', () => {
      setValues(0, 0, { weight: 0, reps: 10 });

      expect(component.filledSetCount).toBe(1);
      expect(component.sessionForm.valid).toBe(true);
    });

    it('wertet einen Satz mit Wiederholungen aber ohne Gewicht als ungültig', () => {
      setValues(0, 0, { weight: null, reps: 8 });

      const set = component.sessionForm.controls.sessionExercises.at(0).at(0);
      expect(set.hasError('weightMissing')).toBe(true);
      expect(component.filledSetCount).toBe(0);
    });

    it.each([0, -1, 1.5])('lehnt die Wiederholungszahl %s ab', (reps) => {
      setValues(0, 0, { reps });

      const set = component.sessionForm.controls.sessionExercises.at(0).at(0);
      expect(set.controls.reps.invalid).toBe(true);
      expect(component.filledSetCount).toBe(0);
    });

    it('lehnt ein negatives Gewicht ab', () => {
      setValues(0, 0, { weight: -5, reps: 8 });

      const set = component.sessionForm.controls.sessionExercises.at(0).at(0);
      expect(set.controls.weight.invalid).toBe(true);
    });
  });

  describe('Buttons', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('deaktiviert „Beenden“, solange kein Satz ausgefüllt ist', () => {
      expect(component.isFinishDisabled).toBe(true);

      setValues(0, 0, { reps: 8 });

      expect(component.isFinishDisabled).toBe(false);
    });

    it('deaktiviert „Beenden“ und „Verwerfen“ nach dem Speichern', () => {
      setValues(0, 0, { reps: 8 });
      component.finishSession();

      expect(component.savedSessionId()).toBe('session-1');
      expect(component.isFinishDisabled).toBe(true);
      expect(component.isDiscardDisabled).toBe(true);
    });
  });

  describe('Training beenden', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('nennt im Dialog die Anzahl ausgefüllter Sätze', () => {
      setValues(0, 0, { reps: 8 });
      setValues(1, 0, { reps: 10 });

      component.finishSession();

      const config = dialogMock.open.mock.calls[0][1];
      expect(config.data.message).toContain('2 von 3 Sätzen');
    });

    it('speichert nur ausgefüllte Sätze mit lückenlosen Satznummern', () => {
      setValues(0, 1, { reps: 8 });
      setValues(1, 0, { weight: 0, reps: 12 });

      component.finishSession();

      expect(sessionServiceMock.create).toHaveBeenCalledWith({
        sourceWorkoutId: 'workout-1',
        startedAt: '2026-01-01T10:00:00Z',
        sessionExercises: [
          {
            sourceExerciseId: 'exercise-1',
            position: 1,
            sets: [{ setNumber: 1, weight: 60, reps: 8 }],
          },
          {
            sourceExerciseId: 'exercise-2',
            position: 2,
            sets: [{ setNumber: 1, weight: 0, reps: 12 }],
          },
        ],
      });
      expect(component.savedSessionId()).toBe('session-1');
      expect(component.saving()).toBe(false);
    });

    it('speichert nicht, wenn der Dialog abgebrochen wird', () => {
      setDialogResult(false);
      setValues(0, 0, { reps: 8 });

      component.finishSession();

      expect(sessionServiceMock.create).not.toHaveBeenCalled();
    });

    it('speichert nicht, wenn kein Satz ausgefüllt ist', () => {
      component.finishSession();

      expect(sessionServiceMock.create).not.toHaveBeenCalled();
      expect(component.saveError()).toBe('Bitte fülle mindestens einen Satz aus.');
    });

    it('speichert nicht und markiert Fehler, wenn ein Satz ungültig ist', () => {
      setValues(0, 0, { reps: 8 });
      setValues(1, 0, { reps: 5, weight: null });

      component.finishSession();

      expect(sessionServiceMock.create).not.toHaveBeenCalled();
      expect(component.saveError()).toBe('Bitte überprüfe deine Eingaben.');
      expect(component.sessionForm.controls.sessionExercises.at(1).at(0).touched).toBe(true);
    });

    it('zeigt einen Fehler und erlaubt einen neuen Versuch, wenn das Speichern fehlschlägt', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      sessionServiceMock.create.mockReturnValue(throwError(() => new Error('boom')));
      setValues(0, 0, { reps: 8 });

      component.finishSession();

      expect(component.saveError()).toBe('Fehler beim Speichern der Session.');
      expect(component.saving()).toBe(false);
      expect(component.savedSessionId()).toBeNull();
      expect(component.isFinishDisabled).toBe(false);
    });

    it('speichert dieselbe Session nicht ein zweites Mal', () => {
      setValues(0, 0, { reps: 8 });

      component.finishSession();
      component.finishSession();

      expect(sessionServiceMock.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Training verwerfen', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('navigiert nach Bestätigung zur Workout-Übersicht, ohne zu speichern', () => {
      setValues(0, 0, { reps: 8 });

      component.discardSession();

      expect(sessionServiceMock.create).not.toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/workouts']);
    });

    it('bleibt auf der Seite, wenn der Dialog abgebrochen wird', () => {
      setDialogResult(false);

      component.discardSession();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});
