import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ExerciseList } from './exercise-list';
import { ExerciseService } from '../services/exercise-service';
import { NotificationService } from '../../../core/services/notification-service';
import { Exercise } from '../models/exercise';

describe('ExerciseList', () => {
  const exercises: Exercise[] = [
    { id: 'e1', name: 'Kniebeuge', muscleGroup: 'LEGS', description: '' },
    { id: 'e2', name: 'Rudern', muscleGroup: 'BACK', description: '' },
  ];

  const serviceMock = { getAll: vi.fn(), delete: vi.fn() };
  const notificationMock = { success: vi.fn(), error: vi.fn() };
  const dialogMock = { open: vi.fn() };

  function setDialogResult(result: unknown): void {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(result) });
  }

  async function createComponent(): Promise<ExerciseList> {
    await TestBed.configureTestingModule({
      imports: [ExerciseList],
      providers: [
        { provide: ExerciseService, useValue: serviceMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExerciseList);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.getAll.mockReturnValue(of(exercises));
    serviceMock.delete.mockReturnValue(of(undefined));
    setDialogResult(true);
  });

  it('lädt die Übungen beim Start', async () => {
    const component = await createComponent();

    expect(component.exercises()).toEqual(exercises);
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBeNull();
  });

  it('zeigt einen Fehler, wenn das Laden fehlschlägt', async () => {
    serviceMock.getAll.mockReturnValue(throwError(() => new Error('boom')));

    const component = await createComponent();

    expect(component.loadError()).toBe('Die Übungen konnten nicht geladen werden.');
    expect(component.loading()).toBe(false);
    expect(notificationMock.error).toHaveBeenCalled();
  });

  it('lädt die Liste neu, wenn der Übungsdialog mit Ergebnis schließt', async () => {
    const component = await createComponent();
    serviceMock.getAll.mockClear();

    component.openExerciseDialog(exercises[0]);

    expect(dialogMock.open.mock.calls[0][1]).toEqual({ data: { exercise: exercises[0] } });
    expect(serviceMock.getAll).toHaveBeenCalledTimes(1);
  });

  it('lädt die Liste nicht neu, wenn der Übungsdialog abgebrochen wird', async () => {
    const component = await createComponent();
    serviceMock.getAll.mockClear();
    setDialogResult(undefined);

    component.openExerciseDialog();

    expect(serviceMock.getAll).not.toHaveBeenCalled();
  });

  it('löscht nach Bestätigung und lädt neu', async () => {
    const component = await createComponent();
    serviceMock.getAll.mockClear();

    component.deleteExercise('e1');

    expect(serviceMock.delete).toHaveBeenCalledWith('e1');
    expect(notificationMock.success).toHaveBeenCalledWith('Übung erfolgreich gelöscht');
    expect(serviceMock.getAll).toHaveBeenCalledTimes(1);
  });

  it('löscht nicht, wenn die Bestätigung abgebrochen wird', async () => {
    const component = await createComponent();
    setDialogResult(false);

    component.deleteExercise('e1');

    expect(serviceMock.delete).not.toHaveBeenCalled();
  });

  it('meldet einen Fehler, wenn das Löschen fehlschlägt', async () => {
    serviceMock.delete.mockReturnValue(throwError(() => new Error('conflict')));
    const component = await createComponent();
    serviceMock.getAll.mockClear();

    component.deleteExercise('e1');

    expect(notificationMock.error).toHaveBeenCalledWith('Fehler beim Löschen der Übung');
    expect(serviceMock.getAll).not.toHaveBeenCalled();
  });
});
