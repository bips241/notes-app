import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { User } from '../../shared/models/interfaces';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})
export class UserDashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: any = {};
  isLoading = true;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    
    // Auto-reload once after user login to ensure fresh data
    const lastLoginRole = localStorage.getItem('lastLoginRole');
    const userReloaded = localStorage.getItem('userDashboardReloaded');
    
    // If user just logged in as user and hasn't reloaded yet
    if (lastLoginRole === 'user' && !userReloaded) {
      localStorage.setItem('userDashboardReloaded', 'true');
      // Force page reload with cache busting
      window.location.reload();
      return;
    }
    
    // Load dashboard data
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    this.analyticsService.getDashboardStats().subscribe({
      next: (response) => {
        this.stats = response.stats || {};
        // Ensure all expected properties exist with default values
        this.stats = {
          myNotes: this.stats.myNotes || 0,
          sharedWithMe: this.stats.sharedWithMe || 0,
          archivedNotes: this.stats.archivedNotes || 0,
          ...this.stats
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        // Retry once after a short delay
        setTimeout(() => {
          this.loadDashboardStats();
        }, 1000);
      }
    });
  }
}
