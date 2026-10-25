import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { unauthorizedInterceptor } from './unauthorized.interceptor';
import { AuthService } from '../../features/auth/services/auth-service';
import { TokenStorageService } from '../services/token-storage.service';

describe('unauthorizedInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  const authServiceMock = { logout: vi.fn() };
  const routerMock = { navigate: vi.fn() };
  const tokenStorageMock = { getToken: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([unauthorizedInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  function failWith(url: string, status: number): void {
    http.get(url).subscribe({ error: () => undefined });
    httpTesting.expectOne(url).flush('error', { status, statusText: 'error' });
  }

  it('should log out and redirect on 401 if a token was sent', () => {
    tokenStorageMock.getToken.mockReturnValue('token');

    failWith('/api/workouts', 401);

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not log out on 401 without a token', () => {
    tokenStorageMock.getToken.mockReturnValue(null);

    failWith('/api/workouts', 401);

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });

  it.each(['/api/auth/login', '/api/users/me'])('should not log out on 401 for %s', (url) => {
    tokenStorageMock.getToken.mockReturnValue('token');

    failWith(url, 401);

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });

  it.each([403, 404, 500])('should not log out on status %i', (status) => {
    tokenStorageMock.getToken.mockReturnValue('token');

    failWith('/api/workouts', status);

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });

  it('should still pass the error on to the caller', () => {
    tokenStorageMock.getToken.mockReturnValue('token');
    const onError = vi.fn();

    http.get('/api/workouts').subscribe({ error: onError });
    httpTesting.expectOne('/api/workouts').flush('error', { status: 401, statusText: 'Unauthorized' });

    expect(onError).toHaveBeenCalled();
  });
});
