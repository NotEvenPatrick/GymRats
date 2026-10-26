import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification-service';

describe('NotificationService', () => {
  let service: NotificationService;
  const snackBarMock = { open: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: snackBarMock }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('zeigt Erfolgsmeldungen 3 Sekunden an', () => {
    service.success('Gespeichert');

    expect(snackBarMock.open).toHaveBeenCalledWith('Gespeichert', undefined, { duration: 3000 });
  });

  it('zeigt Fehlermeldungen 5 Sekunden an', () => {
    service.error('Fehler');

    expect(snackBarMock.open).toHaveBeenCalledWith('Fehler', undefined, { duration: 5000 });
  });

  it('zeigt Infomeldungen 3 Sekunden an', () => {
    service.info('Hinweis');

    expect(snackBarMock.open).toHaveBeenCalledWith('Hinweis', undefined, { duration: 3000 });
  });
});
