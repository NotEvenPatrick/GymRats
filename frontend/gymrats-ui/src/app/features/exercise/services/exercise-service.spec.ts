import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExerciseService } from './exercise-service';
import { Exercise } from '../models/exercise';
import { ExerciseRequest } from '../models/exercise-request';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let http: HttpTestingController;

  const exercise: Exercise = { id: 'e1', name: 'Kniebeuge', muscleGroup: 'LEGS', description: '' };
  const request: ExerciseRequest = { name: 'Kniebeuge', muscleGroup: 'LEGS', description: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExerciseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('#getAll() lädt alle Übungen', () => {
    let result: Exercise[] | undefined;
    service.getAll().subscribe((r) => (result = r));

    const req = http.expectOne('/api/exercises');
    expect(req.request.method).toBe('GET');
    req.flush([exercise]);

    expect(result).toEqual([exercise]);
  });

  it('#getById() lädt eine Übung', () => {
    let result: Exercise | undefined;
    service.getById('e1').subscribe((r) => (result = r));

    const req = http.expectOne('/api/exercises/e1');
    expect(req.request.method).toBe('GET');
    req.flush(exercise);

    expect(result).toEqual(exercise);
  });

  it('#create() sendet die Übung per POST', () => {
    service.create(request).subscribe();

    const req = http.expectOne('/api/exercises');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(exercise);
  });

  it('#update() sendet die Übung per PUT an die ID', () => {
    service.update('e1', request).subscribe();

    const req = http.expectOne('/api/exercises/e1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(exercise);
  });

  it('#delete() löscht die Übung per DELETE', () => {
    service.delete('e1').subscribe();

    const req = http.expectOne('/api/exercises/e1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
