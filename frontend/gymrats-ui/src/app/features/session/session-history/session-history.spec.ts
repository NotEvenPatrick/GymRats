import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { SessionHistory } from './session-history';
import { SessionService } from '../services/session-service';
import { SessionSummary } from '../models/session-summary';

describe('SessionHistory', () => {
  const sessionService = { getHistory: vi.fn() };

  async function create() {
    await TestBed.configureTestingModule({
      imports: [SessionHistory],
      providers: [provideRouter([]), { provide: SessionService, useValue: sessionService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(SessionHistory);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    sessionService.getHistory.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('lädt die Historie', async () => {
    const sessions: SessionSummary[] = [
      { id: '1', workoutName: 'Push', startedAt: '2026-01-01T10:00:00', endedAt: '2026-01-01T11:00:00', exerciseCount: 3 },
    ];
    sessionService.getHistory.mockReturnValue(of(sessions));

    const component = await create();

    expect(component.sessions()).toEqual(sessions);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('verarbeitet eine leere Historie', async () => {
    sessionService.getHistory.mockReturnValue(of([]));

    const component = await create();

    expect(component.sessions()).toEqual([]);
    expect(component.error()).toBeNull();
  });

  it('zeigt einen Fehler, wenn das Laden scheitert', async () => {
    sessionService.getHistory.mockReturnValue(throwError(() => new Error('500')));

    const component = await create();

    expect(component.error()).toBe('Die Trainingshistorie konnte nicht geladen werden.');
    expect(component.loading()).toBe(false);
  });

  it('bleibt im Ladezustand, solange die Antwort aussteht', async () => {
    sessionService.getHistory.mockReturnValue(new Subject<SessionSummary[]>());

    const component = await create();

    expect(component.loading()).toBe(true);
  });
});
