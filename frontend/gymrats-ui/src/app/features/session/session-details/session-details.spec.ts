import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { SessionDetails } from './session-details';
import { SessionService } from '../services/session-service';
import { Session } from '../models/session';

describe('SessionDetails', () => {
  const sessionService = { getById: vi.fn() };

  async function create(id: string | null) {
    await TestBed.configureTestingModule({
      imports: [SessionDetails],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: sessionService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SessionDetails);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    sessionService.getById.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('lädt die Session anhand der Route-ID', async () => {
    const session = { id: 's1' } as unknown as Session;
    sessionService.getById.mockReturnValue(of(session));

    const component = await create('s1');

    expect(sessionService.getById).toHaveBeenCalledWith('s1');
    expect(component.session()).toBe(session);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('zeigt einen Fehler ohne Aufruf, wenn die ID fehlt', async () => {
    const component = await create(null);

    expect(sessionService.getById).not.toHaveBeenCalled();
    expect(component.error()).toBe('Ungültige Session-ID.');
    expect(component.loading()).toBe(false);
  });

  it('zeigt einen Fehler, wenn das Laden scheitert', async () => {
    sessionService.getById.mockReturnValue(throwError(() => new Error('404')));

    const component = await create('s1');

    expect(component.session()).toBeNull();
    expect(component.error()).toBe('Die Trainingsdetails konnten nicht geladen werden.');
    expect(component.loading()).toBe(false);
  });

  it('bleibt im Ladezustand, solange die Antwort aussteht', async () => {
    sessionService.getById.mockReturnValue(new Subject<Session>());

    const component = await create('s1');

    expect(component.loading()).toBe(true);
  });
});
