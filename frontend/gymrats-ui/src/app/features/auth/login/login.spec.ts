import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../services/auth-service';

describe('Login', () => {
  let component: Login;

  const authServiceMock = { login: vi.fn() };
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  function fillValidForm(): void {
    component.form.setValue({ email: 'max@example.com', password: 'geheim123' });
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    authServiceMock.login.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('sendet ein leeres Formular nicht ab und markiert die Felder', () => {
    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(component.form.controls.email.touched).toBe(true);
    expect(component.form.controls.password.touched).toBe(true);
  });

  it('sendet keine ungültige E-Mail-Adresse ab', () => {
    component.form.setValue({ email: 'keine-mail', password: 'geheim123' });

    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('meldet bei Erfolg an und navigiert zur Startseite', () => {
    fillValidForm();

    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'max@example.com', password: 'geheim123' });
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it.each([401, 403])('zeigt bei Status %s die Meldung für falsche Zugangsdaten', (status) => {
    authServiceMock.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
    fillValidForm();

    component.onSubmit();

    expect(component.errorMessage()).toBe('E-Mail oder Passwort ist falsch.');
    expect(component.saving()).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('zeigt bei anderen Fehlern eine allgemeine Meldung', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    fillValidForm();

    component.onSubmit();

    expect(component.errorMessage()).toBe('Die Anmeldung ist fehlgeschlagen. Bitte versuche es später erneut.');
    expect(component.saving()).toBe(false);
  });

  it('setzt eine frühere Fehlermeldung beim erneuten Absenden zurück', () => {
    authServiceMock.login.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })));
    fillValidForm();
    component.onSubmit();
    expect(component.errorMessage()).not.toBeNull();

    component.onSubmit();

    expect(component.errorMessage()).toBeNull();
  });

  it('verhindert doppeltes Absenden, solange die Anfrage läuft', () => {
    authServiceMock.login.mockReturnValue(new Subject());
    fillValidForm();

    component.onSubmit();
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(component.saving()).toBe(true);
  });
});
