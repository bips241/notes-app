import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { User } from '../../shared/models/interfaces';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: any = {};
  isLoading = true;
  mostActiveUsers: any[] = [];
  mostUsedTags: any[] = [];
  notesPerDay: any[] = [];
  loadingAnalytics = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    console.log('👤 Current user:', this.currentUser);
    
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.error = 'Access denied. Admin role required.';
      this.isLoading = false;
      return;
    }
    
    this.loadDashboardStats();
    this.loadAnalytics();
  }

  loadDashboardStats() {
    console.log('📊 Loading dashboard stats...');
    this.analyticsService.getDashboardStats().subscribe({
      next: (response) => {
        console.log('✅ Dashboard stats loaded:', response);
        this.stats = response.stats || {};
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading dashboard stats:', error);
        this.error = 'Failed to load dashboard statistics';
        this.isLoading = false;
      }
    });
  }

  loadAnalytics() {
    console.log('📈 Loading analytics data...');
    this.loadingAnalytics = true;
    
    // Load most active users
    this.analyticsService.getMostActiveUsers(5).subscribe({
      next: (response) => {
        console.log('👥 Most active users loaded:', response);
        this.mostActiveUsers = response.users || [];
      },
      error: (error) => {
        console.error('❌ Error loading active users:', error);
        this.mostActiveUsers = [];
      }
    });

    // Load most used tags
    this.analyticsService.getMostUsedTags(10).subscribe({
      next: (response) => {
        console.log('🏷️ Most used tags loaded:', response);
        this.mostUsedTags = response.tags || [];
      },
      error: (error) => {
        console.error('❌ Error loading tags:', error);
        this.mostUsedTags = [];
      }
    });

    // Load notes per day for the last 7 days
    this.analyticsService.getNotesPerDay(7).subscribe({
      next: (response) => {
        console.log('📈 Notes per day loaded:', response);
        this.notesPerDay = response.data || [];
        this.loadingAnalytics = false;
      },
      error: (error) => {
        console.error('❌ Error loading notes per day:', error);
        this.notesPerDay = [];
        this.loadingAnalytics = false;
      }
    });
  }

  getActiveUsersPercentage(): number {
    if (!this.stats.totalUsers || this.stats.totalUsers === 0) return 0;
    return Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100);
  }

  getArchivedNotesPercentage(): number {
    if (!this.stats.totalNotes || this.stats.totalNotes === 0) return 0;
    return Math.round((this.stats.archivedNotes / this.stats.totalNotes) * 100);
  }

  getTotalNotesThisWeek(): number {
    return this.notesPerDay.reduce((total, day) => total + day.count, 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getMaxNotesPerDay(): number {
    if (this.notesPerDay.length === 0) return 1;
    return Math.max(...this.notesPerDay.map(day => day.count), 1);
  }
}
