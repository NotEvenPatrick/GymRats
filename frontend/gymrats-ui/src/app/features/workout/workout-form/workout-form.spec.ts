import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutForm } from './workout-form';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { WorkoutService } from '../services/workout-service';
import { NotificationService } from '../../../core/services/notification-service';
import { ExerciseService } from '../../exercise/services/exercise-service';

describe('WorkoutForm', () => {

  let component: WorkoutForm;
  let fixture: ComponentFixture<WorkoutForm>;

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true)
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({})
    }
  };

  const exerciseServiceMock = {
    getAll: vi.fn().mockReturnValue(of([]))
  };

  const workoutServiceMock = {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  };

  const notificationServiceMock = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  };

  beforeEach(async () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({});
    workoutServiceMock.getById.mockReset();
    workoutServiceMock.create.mockReset();
    workoutServiceMock.update.mockReset();

    await TestBed.configureTestingModule({
      imports: [WorkoutForm],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ExerciseService, useValue: exerciseServiceMock },
        { provide: WorkoutService, useValue: workoutServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#addExerciseRow() should add a new exercise row', () => {
    component.addExerciseRow();
    expect(component.exerciseRows.length).toBe(1);

    const row = component.exerciseRows.at(0);

    expect(row.get('exerciseId')).toBeTruthy();
    expect(row.get('exerciseSearch')).toBeTruthy();
    expect(row.get('plannedSets')).toBeTruthy();
    expect(row.get('minReps')).toBeTruthy();
    expect(row.get('maxReps')).toBeTruthy();

    expect(row.invalid).toBe(true);
  });

  it('#removeExerciseRow() should remove an exercise row', () => {
    component.addExerciseRow();
    component.addExerciseRow();

    const secondRow = component.exerciseRows.at(1);

    secondRow.patchValue({
      exerciseId: 'exercise-2',
      plannedSets: 3,
      minReps: 6,
      maxReps: 8
    });

    component.removeExerciseRow(0);

    expect(component.exerciseRows.length).toBe(1);
    expect(component.exerciseRows.at(0)).toBe(secondRow);
    expect(component.exerciseRows.at(0).get('exerciseId')?.value).toBe('exercise-2');
  });

  it('#exerciseRows should reject an invalid repetition range', () => {
    component.addExerciseRow();

    const row = component.exerciseRows.at(0);

    row.patchValue({
      exerciseId: 'exercise-1',
      plannedSets: 3,
      minReps: 10,
      maxReps: 5
    });

    expect(row.hasError('invalidRepetitionRange')).toBe(true);
    expect(row.invalid).toBe(true);
  });

  it('#exerciseRows should accept a valid repetition range', () => {
    component.addExerciseRow();

    const row = component.exerciseRows.at(0);

    row.patchValue({
      exerciseId: 'exercise-1',
      plannedSets: 3,
      minReps: 5,
      maxReps: 10
    });

    expect(row.hasError('invalidRepetitionRange')).toBe(false);
    expect(row.invalid).toBe(false);
  });

  it('#drop should assign positions according to the current row order when saving', () => {
    workoutServiceMock.create.mockReturnValue(of({}));

    component.form.controls.name.setValue('Workout Name');

    component.addExerciseRow();
    component.addExerciseRow();

    component.exerciseRows.at(0).patchValue({
      exerciseId: 'exercise-1',
      plannedSets: 3,
      minReps: 5,
      maxReps: 10
    });

    component.exerciseRows.at(1).patchValue({
      exerciseId: 'exercise-2',
      plannedSets: 3,
      minReps: 6,
      maxReps: 8
    });

    component.drop({
      previousIndex: 1,
      currentIndex: 0
    } as CdkDragDrop<FormGroup[]>);

    expect(component.form.valid).toBe(true);
    expect(component['workoutId']).toBeNull();

    component.onSubmit();

    expect(workoutServiceMock.create).toHaveBeenCalledWith({
      name: 'Workout Name',
      description: '',
      exercises: [
        {
          exerciseId: 'exercise-2',
          plannedSets: 3,
          minReps: 6,
          maxReps: 8,
          position: 1
        },
        {
          exerciseId: 'exercise-1',
          plannedSets: 3,
          minReps: 5,
          maxReps: 10,
          position: 2
        }
      ]
    });
  });

  it('#onSubmit() should not save an invalid form', () => {
    vi.clearAllMocks();

    component.onSubmit();

    expect(component.form.invalid).toBe(true);
    expect(component.form.touched).toBe(true);
    expect(workoutServiceMock.create).not.toHaveBeenCalled();
    expect(workoutServiceMock.update).not.toHaveBeenCalled();
  });

  it('onSubmit() should update an existing workout', () => {
    const workoutId = 'workout-1';
    component['workoutId'] = workoutId;

    workoutServiceMock.update.mockReturnValue(of({}));

    component.form.controls.name.setValue('Updated Workout Name');

    component.addExerciseRow();

    const row = component.exerciseRows.at(0);

    row.patchValue({
      exerciseId: 'exercise-1',
      plannedSets: 3,
      minReps: 5,
      maxReps: 10
    });

    component.onSubmit();

    expect(workoutServiceMock.update).toHaveBeenCalledWith(workoutId, {
      name: 'Updated Workout Name',
      description: '',
      exercises: [
        {
          exerciseId: 'exercise-1',
          plannedSets: 3,
          minReps: 5,
          maxReps: 10,
          position: 1
        }
      ]
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/workouts']);
  });

  it('#loadWorkout() should populate the form with existing workout data', async () => {
    const mockWorkout = {
      id: 'workout-1',
      name: 'Push Day',
      description: 'Chest and shoulders',
      ownerId: 'user-1',
      exercises: [
        {
          id: 'workout-exercise-1',
          exerciseId: 'exercise-1',
          exerciseName: 'Bench Press',
          muscleGroup: 'CHEST',
          position: 1,
          plannedSets: 3,
          minReps: 6,
          maxReps: 10
        }
      ]
    };

    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: 'workout-1' });

    workoutServiceMock.getById.mockReturnValue(of(mockWorkout));

    fixture.destroy();
    fixture = TestBed.createComponent(WorkoutForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(workoutServiceMock.getById).toHaveBeenCalledWith('workout-1');

    expect(component.form.controls.name.value).toBe('Push Day');
    expect(component.form.controls.description.value).toBe('Chest and shoulders');

    expect(component.exerciseRows.length).toBe(1);

    const row = component.exerciseRows.at(0);

    expect(row.get('exerciseId')?.value).toBe('exercise-1');
    expect(row.get('exerciseSearch')?.value).toBe('Bench Press');
    expect(row.get('plannedSets')?.value).toBe(3);
    expect(row.get('minReps')?.value).toBe(6);
    expect(row.get('maxReps')?.value).toBe(10);
  });

  it('#onSubmit() should show an error when saving fails', () => {
    vi.clearAllMocks();

    workoutServiceMock.create.mockReturnValue(
      throwError(() => new Error('Server error'))
    );
    component.form.controls.name.setValue('Workout Name');

    component.addExerciseRow();

    const row = component.exerciseRows.at(0);

    row.patchValue({
      exerciseId: 'exercise-1',
      plannedSets: 3,
      minReps: 5,
      maxReps: 10
    });

    expect(component.exerciseRows.length).toBe(1);
    expect(row.valid).toBe(true);

    component.onSubmit();

    expect(workoutServiceMock.create).toHaveBeenCalled();
    expect(notificationServiceMock.error).toHaveBeenCalledWith(
      'Fehler beim Speichern des Trainingsplan.'
    );
    expect(notificationServiceMock.success).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('#loadWorkout() should notify and navigate when loading fails', async () => {
    vi.clearAllMocks();

    activatedRouteMock.snapshot.paramMap =
      convertToParamMap({ id: 'workout-1' });

    workoutServiceMock.getById.mockReturnValue(
      throwError(() => new Error('Server error'))
    );

    fixture.destroy();
    fixture = TestBed.createComponent(WorkoutForm);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();

    expect(workoutServiceMock.getById).toHaveBeenCalledWith('workout-1');

    expect(notificationServiceMock.error).toHaveBeenCalledWith(
      'Fehler beim Laden des Workouts.'
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/workouts']);
  });
});