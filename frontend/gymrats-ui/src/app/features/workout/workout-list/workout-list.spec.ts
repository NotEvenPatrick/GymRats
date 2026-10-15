import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutList } from './workout-list';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { WorkoutService } from '../services/workout-service';
import { NotificationService } from '../../../core/services/notification-service';
import { MatDialog } from '@angular/material/dialog';

describe('WorkoutList', () => {
  let component: WorkoutList;
  let fixture: ComponentFixture<WorkoutList>;

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true)
  };

  const workoutServiceMock = {
    getAll: vi.fn().mockReturnValue(of([])),
    delete: vi.fn().mockReturnValue(of(true))
  }

  const notificationServiceMock = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  };

  const dialogMock = {
    open: vi.fn().mockReturnValue({
      afterClosed: vi.fn().mockReturnValue(of(true))
    })
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutList],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: WorkoutService, useValue: workoutServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#editWorkout() should navigate to the edit workout page', () => {
    const workoutId = 'workout-1';
    component.editWorkout(workoutId);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/workouts', workoutId, 'edit']);
  });

  it('#toggleExpandedWorkout() should update the expanded workout id correctly', () => {
    const workoutId1 = 'workout-1';
    const workoutId2 = 'workout-2';

    expect(component.expandedWorkoutId()).toBeNull();

    component.toggleExpandedWorkout(workoutId1);
    expect(component.expandedWorkoutId()).toBe(workoutId1);

    component.toggleExpandedWorkout(workoutId2);
    expect(component.expandedWorkoutId()).toBe(workoutId2);

    component.toggleExpandedWorkout(workoutId2);
    expect(component.expandedWorkoutId()).toBeNull();
  });

  it('#deleteWorkout() should call the delete method of the workout service if confirmed, show a success notification and refresh the workout list', () => {
    vi.clearAllMocks();
    const workoutId = 'workout-1';

    component.deleteWorkout(workoutId);

    expect(workoutServiceMock.delete).toHaveBeenCalledWith(workoutId);
    expect(notificationServiceMock.success).toHaveBeenCalledWith('Trainingsplan erfolgreich gelöscht');
    expect(workoutServiceMock.getAll).toHaveBeenCalledTimes(1);
  });

  it('#deleteWorkout() should not call the delete method of the workout service if not confirmed', () => {
    vi.clearAllMocks();
    const workoutId = 'workout-1';

    dialogMock.open.mockReturnValueOnce({
      afterClosed: vi.fn().mockReturnValue(of(false))
    });

    component.deleteWorkout(workoutId);

    expect(dialogMock.open).toHaveBeenCalled();
    expect(workoutServiceMock.delete).not.toHaveBeenCalled();
    expect(notificationServiceMock.success).not.toHaveBeenCalled();
    expect(workoutServiceMock.getAll).not.toHaveBeenCalled();
  });

  it('#deleteWorkout() should show an error notification if the delete method fails', () => {
    vi.clearAllMocks();
    const workoutId = 'workout-1';
    const errorMessage = 'Fehler beim Löschen des Trainingsplans';

    workoutServiceMock.delete.mockReturnValueOnce(throwError(() => new Error('Server error')));

    component.deleteWorkout(workoutId);

    expect(workoutServiceMock.delete).toHaveBeenCalledWith(workoutId);
    expect(notificationServiceMock.error).toHaveBeenCalledWith(errorMessage);
    expect(notificationServiceMock.success).not.toHaveBeenCalled();
    expect(workoutServiceMock.getAll).not.toHaveBeenCalled();
  });

  it('#loadWorkouts() should show an error notification if the getAll method fails', () => {
    vi.clearAllMocks();

    workoutServiceMock.getAll.mockReturnValueOnce(throwError(() => new Error('Server error')));

    component['loadWorkouts']();

    expect(workoutServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(notificationServiceMock.error).toHaveBeenCalledWith('Fehler beim Laden der Trainingspläne');
  });

  it('#loadWorkouts() should populate the workouts list when getAll succeeds', () => {
    vi.clearAllMocks();
    const mockWorkouts = [{
      id: 'workout-1',
      name: 'Push Day',
      description: 'Chest and shoulders',
      ownerId: 'user-1',
      exercises: []
    }]
    workoutServiceMock.getAll.mockReturnValueOnce(of(mockWorkouts));

    component['loadWorkouts']();

    expect(workoutServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(component.workouts()).toEqual(mockWorkouts);
  });
});
