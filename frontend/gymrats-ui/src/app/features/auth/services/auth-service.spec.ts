import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { RegisterRequest, RegisterResponse } from '../models/register';
import { LoginRequest, LoginResponse } from '../models/login';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { CurrentUser } from '../models/current-user';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  const tokenStorageMock = {
    saveToken: vi.fn(),
    removeToken: vi.fn(),
    getToken: vi.fn()
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenStorageService, useValue: tokenStorageMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#register() should call the correct API endpoint', () => {
    const request: RegisterRequest = {
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@example.com',
      password: 'password123'
    };
    const response: RegisterResponse = {
      id: '1',
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@example.com'
    };

    service.register(request).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const req = httpTestingController.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(response);
  });

  it('#login() should save the token and set the user on successful login', async () => {
    const request: LoginRequest = {
      email: 'testuser@example.com',
      password: 'password123'
    };

    const response: LoginResponse = {
      userId: '1',
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@example.com',
      token: 'fake-jwt-token'
    };

    service.login(request).subscribe();

    const req = httpTestingController.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush(response);

    expect(tokenStorageMock.saveToken).toHaveBeenCalledWith(response.token);

    const user = await firstValueFrom(service.currentUser$);

    expect(user).toEqual({
      id: response.userId,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email
    });
  });

  it('#logout() should remove the token and set the user to null', async () => {
    const request: LoginRequest = {
      email: 'testuser@example.com',
      password: 'password123'
    };
    const response: LoginResponse = {
      userId: '1',
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@example.com',
      token: 'fake-jwt-token'
    };

    service.login(request).subscribe();
    const req = httpTestingController.expectOne('/api/auth/login');

    req.flush(response);
    expect(await firstValueFrom(service.currentUser$)).toEqual({
      id: response.userId,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email
    });

    service.logout();

    expect(tokenStorageMock.removeToken).toHaveBeenCalled();

    const user = await firstValueFrom(service.currentUser$);
    expect(user).toBeNull();
  });

  it('#restoreSession() should set the user if a valid token exists', async () => {
    const response: CurrentUser = {
      id: '1',
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@example.com',
    };

    tokenStorageMock.getToken.mockReturnValue('fake-jwt-token');

    const restorePromise = firstValueFrom(service.restoreSession());

    const req = httpTestingController.expectOne('/api/users/me');
    expect(req.request.method).toBe('GET');
    req.flush(response);

    const user = await restorePromise;
    expect(user).toEqual({
      id: response.id,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email
    });
  });

  it('#restoreSession() should return null if no valid token exists', async () => {
    tokenStorageMock.getToken.mockReturnValue(null);
    const user = await firstValueFrom(service.restoreSession());

    httpTestingController.expectNone('/api/users/me');

    expect(user).toBeNull();
    expect(tokenStorageMock.getToken).toHaveBeenCalled();
  });

  it('#restoreSession() should remove the token if the request returns 401', async () => {
    tokenStorageMock.getToken.mockReturnValue('fake-jwt-token');

    const restorePromise = firstValueFrom(service.restoreSession());

    const req = httpTestingController.expectOne('/api/users/me');
    expect(req.request.method).toBe('GET');

    req.flush(null, {
      status: 401,
      statusText: 'Unauthorized'
    });

    const user = await restorePromise;

    expect(user).toBeNull();
    expect(tokenStorageMock.removeToken).toHaveBeenCalled();
  });
});
