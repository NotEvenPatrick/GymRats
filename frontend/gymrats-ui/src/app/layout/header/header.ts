import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth-service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [
    MatToolbarModule, 
    MatButtonModule, 
    RouterLink, 
    RouterLinkActive
  ],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router); 

  protected readonly navItems: { label: string; route: string }[] = [
    { label: 'Home', route: '/home' },
    { label: 'Übungen', route: '/exercises' },
  ];

  public onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
