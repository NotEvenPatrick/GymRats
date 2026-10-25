import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../../features/auth/services/auth-service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const authServiceMock: { currentUser: () => { id: string } | null } = {
    currentUser: () => ({ id: 'user-1' })
  };

  const routerMock = {
    parseUrl: vi.fn().mockReturnValue('loginUrlTree')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow an authenticated user', () => {
    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(result).toBe(true);
  });

  it('should redirect an unauthenticated user', () => {
    vi.clearAllMocks();
    authServiceMock.currentUser = () => null;

    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(result).toBe('loginUrlTree');
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/login');
  });
});
