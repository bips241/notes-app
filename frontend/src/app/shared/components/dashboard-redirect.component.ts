import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: '<div>Redirecting...</div>'
})
export class DashboardRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (user.role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
