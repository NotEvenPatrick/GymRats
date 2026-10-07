import { Component, inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth-service';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';
import { HttpClient } from '@angular/common/http';

@Component({
  imports: [],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private tokenStorageService = inject(TokenStorageService);

  testAuth(): void {
    this.authService.currentUser$.subscribe(user => console.log("Current User", user)); 
    console.log("Token ", this.tokenStorageService.getToken());
    
     this.http.get('/api/test', { responseType: 'text' }).subscribe({
      next: response => console.log(response),
      error: error => console.error('Auth test failed:', error)
    });
  }
}
