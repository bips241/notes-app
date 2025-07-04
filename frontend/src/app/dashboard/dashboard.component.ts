import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/models/interfaces';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { UserDashboardComponent } from './user-dashboard/user-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, UserDashboardComponent],
  template: `
    <div *ngIf="isLoading" class="loading-container">
      <p>Loading dashboard...</p>
    </div>
    <div *ngIf="!isLoading && currentUser?.role === 'admin'">
      <app-admin-dashboard></app-admin-dashboard>
    </div>
    <div *ngIf="!isLoading && currentUser?.role === 'user'">
      <app-user-dashboard></app-user-dashboard>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Ensure user is fully loaded before showing dashboard
    setTimeout(() => {
      this.currentUser = this.authService.currentUserValue;
      this.isLoading = false;
    }, 50);
  }
}
