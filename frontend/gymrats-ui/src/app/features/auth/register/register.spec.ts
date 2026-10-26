import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { Register } from './register';
import { AuthService } from '../services/auth-service';

describe('Register', () => {
  let component: Register;

  const authServiceMock = { register: vi.fn() };
  const routerMock = { navigate: vi.fn().mockResolvedValue(true) };

  const validValues = {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max@example.com',
    password: 'geheim123',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    authServiceMock.register.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('sendet ein leeres Formular nicht ab und markiert die Felder', () => {
    component.onSubmit();

    expect(authServiceMock.register).not.toHaveBeenCalled();
    expect(component.form.controls.firstName.touched).toBe(true);
    expect(component.form.controls.password.touched).toBe(true);
  });

  it('lehnt ein Passwort mit 7 Zeichen ab und akzeptiert eines mit 8', () => {
    component.form.setValue({ ...validValues, password: '1234567' });
    expect(component.form.controls.password.hasError('minlength')).toBe(true);

    component.form.setValue({ ...validValues, password: '12345678' });
    expect(component.form.controls.password.valid).toBe(true);
  });

  it('lehnt eine ungültige E-Mail-Adresse ab', () => {
    component.form.setValue({ ...validValues, email: 'keine-mail' });

    component.onSubmit();

    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('registriert bei Erfolg und navigiert zum Login', () => {
    component.form.setValue(validValues);

    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith(validValues);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it.each([
    [400, 'Bitte überprüfe deine Eingaben.'],
    [409, 'Diese E-Mail-Adresse ist bereits registriert.'],
    [500, 'Die Registrierung ist fehlgeschlagen. Bitte versuche es später erneut.'],
  ])('zeigt bei Status %s die passende Meldung', (status, message) => {
    authServiceMock.register.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
    component.form.setValue(validValues);

    component.onSubmit();

    expect(component.errorMessage()).toBe(message);
    expect(component.saving()).toBe(false);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('verhindert doppeltes Absenden, solange die Anfrage läuft', () => {
    authServiceMock.register.mockReturnValue(new Subject());
    component.form.setValue(validValues);

    component.onSubmit();
    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledTimes(1);
    expect(component.saving()).toBe(true);
  });
});
