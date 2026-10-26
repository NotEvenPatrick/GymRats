import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, of, throwError } from 'rxjs';
import { ExerciseForm } from './exercise-form';
import { ExerciseService } from '../services/exercise-service';
import { NotificationService } from '../../../core/services/notification-service';
import { Exercise } from '../models/exercise';

describe('ExerciseForm', () => {
  const serviceMock = { create: vi.fn(), update: vi.fn() };
  const notificationMock = { success: vi.fn(), error: vi.fn() };
  const dialogRefMock = { close: vi.fn() };

  const existing: Exercise = { id: 'e1', name: 'Kniebeuge', muscleGroup: 'LEGS', description: 'Tief' };

  async function createComponent(exercise: Exercise | null): Promise<ExerciseForm> {
    await TestBed.configureTestingModule({
      imports: [ExerciseForm],
      providers: [
        { provide: ExerciseService, useValue: serviceMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { exercise } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExerciseForm);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.create.mockReturnValue(of({}));
    serviceMock.update.mockReturnValue(of({}));
  });

  it('belegt das Formular beim Bearbeiten mit der vorhandenen Übung', async () => {
    const component = await createComponent(existing);

    expect(component.exerciseForm.getRawValue()).toEqual({
      name: 'Kniebeuge',
      muscleGroup: 'LEGS',
      description: 'Tief',
    });
  });

  it('startet beim Anlegen mit leerem Formular', async () => {
    const component = await createComponent(null);

    expect(component.exerciseForm.getRawValue()).toEqual({ name: '', muscleGroup: null, description: '' });
  });

  it('sendet ein ungültiges Formular nicht ab', async () => {
    const component = await createComponent(null);

    component.onSubmit();

    expect(serviceMock.create).not.toHaveBeenCalled();
    expect(component.exerciseForm.controls.name.touched).toBe(true);
  });

  it('legt eine neue Übung mit getrimmten Werten an', async () => {
    const component = await createComponent(null);
    component.exerciseForm.setValue({ name: '  Kreuzheben ', muscleGroup: 'BACK', description: ' schwer ' });

    component.onSubmit();

    expect(serviceMock.create).toHaveBeenCalledWith({ name: 'Kreuzheben', muscleGroup: 'BACK', description: 'schwer' });
    expect(serviceMock.update).not.toHaveBeenCalled();
    expect(notificationMock.success).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('aktualisiert beim Bearbeiten die vorhandene Übung', async () => {
    const component = await createComponent(existing);
    component.exerciseForm.patchValue({ name: 'Frontkniebeuge' });

    component.onSubmit();

    expect(serviceMock.update).toHaveBeenCalledWith('e1', {
      name: 'Frontkniebeuge',
      muscleGroup: 'LEGS',
      description: 'Tief',
    });
    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('meldet einen Fehler und bleibt offen, wenn das Speichern fehlschlägt', async () => {
    serviceMock.create.mockReturnValue(throwError(() => new Error('boom')));
    const component = await createComponent(null);
    component.exerciseForm.setValue({ name: 'Rudern', muscleGroup: 'BACK', description: '' });

    component.onSubmit();

    expect(notificationMock.error).toHaveBeenCalledWith('Fehler beim Speichern der Übung');
    expect(component.saving()).toBe(false);
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('verhindert doppeltes Absenden, solange gespeichert wird', async () => {
    serviceMock.create.mockReturnValue(new Subject());
    const component = await createComponent(null);
    component.exerciseForm.setValue({ name: 'Rudern', muscleGroup: 'BACK', description: '' });

    component.onSubmit();
    component.onSubmit();

    expect(serviceMock.create).toHaveBeenCalledTimes(1);
    expect(component.saving()).toBe(true);
  });
});
