import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('gibt null zurück, wenn kein Token gespeichert ist', () => {
    expect(service.getToken()).toBeNull();
  });

  it('speichert und liest ein Token', () => {
    service.saveToken('abc');

    expect(service.getToken()).toBe('abc');
  });

  it('überschreibt ein vorhandenes Token', () => {
    service.saveToken('alt');
    service.saveToken('neu');

    expect(service.getToken()).toBe('neu');
  });

  it('entfernt das Token', () => {
    service.saveToken('abc');

    service.removeToken();

    expect(service.getToken()).toBeNull();
  });
});
