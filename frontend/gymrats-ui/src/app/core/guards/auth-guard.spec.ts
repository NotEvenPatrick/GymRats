import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { of, Observable, firstValueFrom } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth-service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const authServiceMock: { currentUser$: Observable<{ id: string } | null> } = {
    currentUser$: of({ id: 'user-1' })
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

  it('should allow an authenticated user', async () => {
    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    ) as Observable<boolean>;

    const value = await firstValueFrom(result);
    expect(value).toBe(true);
  });

  it('should redirect an unauthenticated user', async () => {
    vi.clearAllMocks();
    authServiceMock.currentUser$ = of(null);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    ) as Observable<boolean>;

    const value =await firstValueFrom(result);
    expect(value).toBe('loginUrlTree');
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/login');
  });
});
