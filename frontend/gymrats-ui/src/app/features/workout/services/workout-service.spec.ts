import { TestBed } from '@angular/core/testing';
import { WorkoutService } from './workout-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import type { Workout } from '../models/workout';
import { WorkoutRequest } from '../models/workout-request';
import { MuscleGroup } from '../../exercise/models/muscle-group';

describe('WorkoutService', () => {
  let service: WorkoutService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(WorkoutService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getAll() should return expected workouts', () => {
    const mockWorkouts: Workout[] = [
      {
        id: 'workout-1',
        name: 'Push Day',
        description: 'Brust, Schultern und Trizeps',
        ownerId: 'user-1',
        exercises: []
      },
      {
        id: 'workout-2',
        name: 'Pull Day',
        description: 'Rücken und Bizeps',
        ownerId: 'user-1',
        exercises: []
      }
    ];

    service.getAll().subscribe(workouts => {
      expect(workouts).toEqual(mockWorkouts);
    });

    const req = httpTestingController.expectOne('/api/workouts');
    expect(req.request.method).toBe('GET');
    req.flush(mockWorkouts);
  });

  it('#getAll() should propagate an HTTP error', () => {
    expect.assertions(2);

    service.getAll().subscribe({
      error: error => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpTestingController.expectOne('/api/workouts');
    expect(req.request.method).toBe('GET');

    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error'
    });
  });

  it('#getById() should return the expected workout', () => {
    const mockWorkout: Workout = {
      id: 'workout-1',
      name: 'Push Day',
      description: 'Brust, Schultern und Trizeps',
      ownerId: 'user-1',
      exercises: []
    };

    service.getById('workout-1').subscribe(workout => {
      expect(workout).toEqual(mockWorkout);
    });

    const req = httpTestingController.expectOne('/api/workouts/workout-1');
    expect(req.request.method).toBe('GET');
    req.flush(mockWorkout);
  });

  it('#create() should create a new workout', () => {
    const mockRequest: WorkoutRequest = {
      name: 'Push Day',
      description: 'Brust, Schultern und Trizeps',
      exercises: [
        {
          exerciseId: 'exercise-1',
          position: 1,
          plannedSets: 3,
          minReps: 6,
          maxReps: 8
        }
      ]
    };

    const mockResponse: Workout = {
      id: 'workout-1',
      name: 'Push Day',
      description: 'Brust, Schultern und Trizeps',
      ownerId: 'user-1',
      exercises: [
        {
          id: 'workout-exercise-1',
          exerciseId: 'exercise-1',
          exerciseName: 'Bankdrücken',
          muscleGroup: 'CHEST' as MuscleGroup,
          position: 1,
          plannedSets: 3,
          minReps: 6,
          maxReps: 8
        }
      ]
    };

    service.create(mockRequest).subscribe(workout => {
      expect(workout).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('/api/workouts');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);

    req.flush(mockResponse);
  });

  it('#update() should update the workout', () => {
    const mockRequest: WorkoutRequest = {
      name: 'Push Day Updated',
      description: 'Brust, Schultern und Trizeps Updated',
      exercises: [
        {
          exerciseId: 'exercise-1',
          position: 1,
          plannedSets: 4,
          minReps: 8,
          maxReps: 10
        }
      ]
    };

    const mockResponse: Workout = {
      id: 'workout-1',
      name: 'Push Day Updated',
      description: 'Brust, Schultern und Trizeps Updated',
      ownerId: 'user-1',
      exercises: [
        {
          id: 'workout-exercise-1',
          exerciseId: 'exercise-1',
          exerciseName: 'Bankdrücken',
          muscleGroup: 'CHEST' as MuscleGroup,
          position: 1,
          plannedSets: 4,
          minReps: 8,
          maxReps: 10
        }
      ]
    };

    service.update('workout-1', mockRequest).subscribe(workout => {
      expect(workout).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('/api/workouts/workout-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('#delete() should delete the workout', () => {
    service.delete('workout-1').subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne('/api/workouts/workout-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 200, statusText: 'OK' });
  });
});

