import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Header } from './header';
import { AuthService } from '../../features/auth/services/auth-service';

describe('Header', () => {
  const authService = { logout: vi.fn() };

  beforeEach(async () => {
    authService.logout.mockReset();
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
  });

  it('meldet ab und navigiert zum Login', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Header);

    fixture.componentInstance.onLogout();

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
