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
    <div *ngIf="currentUser?.role === 'admin'">
      <app-admin-dashboard></app-admin-dashboard>
    </div>
    <div *ngIf="currentUser?.role === 'user'">
      <app-user-dashboard></app-user-dashboard>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }
}
