import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SessionService } from './session-service';
import { SessionRequest } from '../models/session-request';

describe('SessionService', () => {
  let service: SessionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('#prepareSession() lädt die Vorschau zum Workout', () => {
    service.prepareSession('w1').subscribe();

    const req = http.expectOne('/api/sessions/preview/w1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('#create() sendet die Session per POST', () => {
    const request: SessionRequest = { sourceWorkoutId: 'w1', startedAt: '2026-01-01T10:00:00Z', sessionExercises: [] };

    service.create(request).subscribe();

    const req = http.expectOne('/api/sessions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('#getHistory() lädt die Trainingshistorie', () => {
    service.getHistory().subscribe();

    const req = http.expectOne('/api/sessions');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('#getById() lädt eine einzelne Session', () => {
    service.getById('s1').subscribe();

    const req = http.expectOne('/api/sessions/s1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
