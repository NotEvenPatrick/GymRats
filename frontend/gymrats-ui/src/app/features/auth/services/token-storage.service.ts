import { Service } from '@angular/core';

@Service()
export class TokenStorageService {
    saveToken(value: string): void {
        localStorage.setItem('authToken', value);
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    removeToken(): void {
        localStorage.removeItem('authToken');
    }
}
