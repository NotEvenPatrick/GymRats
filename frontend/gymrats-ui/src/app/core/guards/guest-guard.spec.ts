import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { guestGuard } from './guest-guard';
import { AuthService } from '../../features/auth/services/auth-service';

describe('guestGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => guestGuard(...guardParameters));

  const authServiceMock: { currentUser: () => { id: string } | null } = {
    currentUser: () => null
  };

  const routerMock = {
    parseUrl: vi.fn().mockReturnValue('homeUrlTree')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should allow an unauthenticated user', () => {
    authServiceMock.currentUser = () => null;

    expect(executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBe(true);
  });

  it('should redirect an authenticated user to the home page', () => {
    authServiceMock.currentUser = () => ({ id: 'user-1' });

    expect(executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBe('homeUrlTree');
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/home');
  });
});
