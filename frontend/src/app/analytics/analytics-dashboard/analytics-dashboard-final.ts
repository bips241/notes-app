import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register ECharts components
echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);
import { EChartsOption } from 'echarts';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-analytics-dashboard-final',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <div class="analytics-container">
      <!-- Header -->
      <div class="analytics-header">
        <div class="header-content">
          <div class="header-title">
            <h1>📊 Analytics Dashboard</h1>
            <p>Comprehensive insights and data visualization</p>
          </div>
          <div class="header-actions">
            <button 
              class="refresh-btn" 
              (click)="loadAnalytics()"
              [disabled]="isLoading">
              <span class="btn-icon">{{ isLoading ? '⏳' : '🔄' }}</span>
              <span class="btn-text">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-state">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3>{{ error }}</h3>
          <p>Unable to load analytics data. Please try again.</p>
          <button class="retry-btn" (click)="loadAnalytics()">
            <span>🔄</span>
            Try Again
          </button>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading && !error" class="dashboard-content">
        
        <!-- KPI Cards -->
        <div class="kpi-section">
          <div class="kpi-card users-card">
            <div class="kpi-header">
              <div class="kpi-icon">👥</div>
              <div class="kpi-title">Users</div>
            </div>
            <div class="kpi-main">
              <div class="kpi-value">{{ stats.totalUsers || 0 }}</div>
              <div class="kpi-subtitle">Total Users</div>
            </div>
            <div class="kpi-footer">
              <span class="kpi-trend positive">
                +{{ stats.activeUsers || 0 }} active
              </span>
            </div>
          </div>

          <div class="kpi-card notes-card">
            <div class="kpi-header">
              <div class="kpi-icon">📝</div>
              <div class="kpi-title">Notes</div>
            </div>
            <div class="kpi-main">
              <div class="kpi-value">{{ stats.totalNotes || 0 }}</div>
              <div class="kpi-subtitle">Total Notes</div>
            </div>
            <div class="kpi-footer">
              <span class="kpi-trend">
                {{ getNotesThisWeek() }} this week
              </span>
            </div>
          </div>

          <div class="kpi-card tags-card">
            <div class="kpi-header">
              <div class="kpi-icon">🏷️</div>
              <div class="kpi-title">Tags</div>
            </div>
            <div class="kpi-main">
              <div class="kpi-value">{{ mostUsedTags.length || 0 }}</div>
              <div class="kpi-subtitle">Active Tags</div>
            </div>
            <div class="kpi-footer">
              <span class="kpi-trend">
                {{ getTotalTagUsage() }} total uses
              </span>
            </div>
          </div>

          <div class="kpi-card archived-card">
            <div class="kpi-header">
              <div class="kpi-icon">📦</div>
              <div class="kpi-title">Archived</div>
            </div>
            <div class="kpi-main">
              <div class="kpi-value">{{ stats.archivedNotes || 0 }}</div>
              <div class="kpi-subtitle">Archived Notes</div>
            </div>
            <div class="kpi-footer">
              <span class="kpi-trend">
                {{ getArchivePercentage() }}% of total
              </span>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          
          <!-- Notes Activity Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>📈 Notes Activity</h3>
              <p>Daily notes creation over time</p>
            </div>
            <div class="chart-container">
              <div echarts 
                   [options]="notesActivityOptions" 
                   [theme]="'theme1'"
                   class="chart"></div>
            </div>
          </div>

          <!-- Popular Tags Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>🏷️ Popular Tags</h3>
              <p>Most frequently used tags</p>
            </div>
            <div class="chart-container">
              <div echarts 
                   [options]="popularTagsOptions" 
                   [theme]="'theme1'"
                   class="chart"></div>
            </div>
          </div>

          <!-- Active Users Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>👥 Active Users</h3>
              <p>Users by activity level</p>
            </div>
            <div class="chart-container">
              <div echarts 
                   [options]="activeUsersOptions" 
                   [theme]="'theme1'"
                   class="chart"></div>
            </div>
          </div>

          <!-- Usage Distribution Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>📊 Usage Distribution</h3>
              <p>Notes distribution across users</p>
            </div>
            <div class="chart-container">
              <div echarts 
                   [options]="usageDistributionOptions" 
                   [theme]="'theme1'"
                   class="chart"></div>
            </div>
          </div>
        </div>

        <!-- User Rankings Section -->
        <div class="rankings-section">
          <div class="rankings-grid">
            
            <!-- Most Active Users Leaderboard -->
            <div class="leaderboard-card">
              <div class="leaderboard-header">
                <h3>🏆 Most Active Users</h3>
                <p>Ranked by total notes created</p>
              </div>
              <div class="leaderboard-content">
                <div *ngFor="let user of mostActiveUsers; let i = index" 
                     class="leaderboard-item"
                     [class.gold]="i === 0"
                     [class.silver]="i === 1"
                     [class.bronze]="i === 2">
                  <div class="rank-badge">
                    <span class="rank-number">{{ i + 1 }}</span>
                    <span class="medal" *ngIf="i < 3">{{ getMedal(i) }}</span>
                  </div>
                  <div class="user-avatar">
                    <span>{{ getUserInitials(user) }}</span>
                  </div>
                  <div class="user-info">
                    <h4>{{ getUserName(user) }}</h4>
                    <p>{{ user.email }}</p>
                  </div>
                  <div class="user-stats">
                    <div class="stat-value">{{ user.notesCount }}</div>
                    <div class="stat-label">notes</div>
                  </div>
                </div>
                <div *ngIf="!mostActiveUsers.length" class="empty-state">
                  <span>📊</span>
                  <p>No user data available</p>
                </div>
              </div>
            </div>

            <!-- User Notes Count Leaderboard -->
            <div class="leaderboard-card">
              <div class="leaderboard-header">
                <h3>📝 Notes Creation Leaderboard</h3>
                <p>All users ranked by notes created</p>
              </div>
              <div class="leaderboard-content">
                <div *ngFor="let user of getSortedUsersByNotes(); let i = index" 
                     class="leaderboard-item"
                     [class.gold]="i === 0"
                     [class.silver]="i === 1"
                     [class.bronze]="i === 2">
                  <div class="rank-badge">
                    <span class="rank-number">{{ i + 1 }}</span>
                    <span class="medal" *ngIf="i < 3">{{ getMedal(i) }}</span>
                  </div>
                  <div class="user-avatar">
                    <span>{{ getUserInitials(user) }}</span>
                  </div>
                  <div class="user-info">
                    <h4>{{ getUserName(user) }}</h4>
                    <p>{{ user.email }}</p>
                  </div>
                  <div class="user-stats">
                    <div class="stat-value">{{ user.notesCount }}</div>
                    <div class="stat-label">notes</div>
                    <div class="progress-bar">
                      <div class="progress-fill" 
                           [style.width.%]="getProgressPercentage(user.notesCount)"></div>
                    </div>
                  </div>
                </div>
                <div *ngIf="!mostActiveUsers.length" class="empty-state">
                  <span>📝</span>
                  <p>No user data available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Insights Section -->
        <div class="insights-section">
          <div class="insights-card">
            <h3>🔍 Key Insights</h3>
            <div class="insights-grid">
              <div class="insight-item">
                <div class="insight-icon">📊</div>
                <div class="insight-content">
                  <h4>Top Performer</h4>
                  <p>{{ getTopUser() }} has created the most notes</p>
                </div>
              </div>
              <div class="insight-item">
                <div class="insight-icon">🏷️</div>
                <div class="insight-content">
                  <h4>Popular Topic</h4>
                  <p>"{{ getMostPopularTag() }}" is the most used tag</p>
                </div>
              </div>
              <div class="insight-item">
                <div class="insight-icon">📈</div>
                <div class="insight-content">
                  <h4>Growth Rate</h4>
                  <p>{{ getGrowthRate() }}% increase in notes this week</p>
                </div>
              </div>
              <div class="insight-item">
                <div class="insight-icon">⚡</div>
                <div class="insight-content">
                  <h4>Engagement</h4>
                  <p>{{ getEngagementRate() }}% of users are active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./analytics-dashboard-final.scss']
})
export class AnalyticsDashboardFinalComponent implements OnInit, OnDestroy {
  isLoading = false;
  error = '';
  
  stats: any = {};
  mostActiveUsers: any[] = [];
  mostUsedTags: any[] = [];
  notesPerDay: any[] = [];
  
  private subscriptions: Subscription[] = [];
  
  // Chart options
  notesActivityOptions: EChartsOption = {};
  popularTagsOptions: EChartsOption = {};
  activeUsersOptions: EChartsOption = {};
  usageDistributionOptions: EChartsOption = {};

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loadAnalytics();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAnalytics() {
    this.isLoading = true;
    this.error = '';
    const currentUser = this.authService.currentUserValue;
    const isAdmin = currentUser?.role === 'admin';

    // Load all analytics data
    const statsSubscription = this.analyticsService.getDashboardStats().subscribe({
      next: (response) => {
        this.stats = response.stats || {};
        this.updateCharts();
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.error = 'Failed to load dashboard statistics';
        this.isLoading = false;
      }
    });

    // Only load admin-specific analytics if user is admin
    if (isAdmin) {
      const usersSubscription = this.analyticsService.getMostActiveUsers().subscribe({
        next: (response) => {
          this.mostActiveUsers = response.users || [];
          this.updateCharts();
        },
        error: (error) => {
          console.error('Error loading active users:', error);
        }
      });

      const tagsSubscription = this.analyticsService.getMostUsedTags().subscribe({
        next: (response) => {
          this.mostUsedTags = response.tags || [];
          this.updateCharts();
        },
        error: (error) => {
          console.error('Error loading popular tags:', error);
        }
      });

      const notesSubscription = this.analyticsService.getNotesPerDay().subscribe({
        next: (response) => {
          this.notesPerDay = response.data || [];
          this.updateCharts();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notes per day:', error);
          this.isLoading = false;
        }
      });

      this.subscriptions.push(statsSubscription, usersSubscription, tagsSubscription, notesSubscription);
    } else {
      // For regular users, just load basic stats
      this.subscriptions.push(statsSubscription);
      this.isLoading = false;
    }
  }

  updateCharts() {
    this.updateNotesActivityChart();
    this.updatePopularTagsChart();
    this.updateActiveUsersChart();
    this.updateUsageDistributionChart();
  }

  updateNotesActivityChart() {
    if (!this.notesPerDay.length) return;

    const dates = this.notesPerDay.map(item => item.date);
    const counts = this.notesPerDay.map(item => item.count);

    this.notesActivityOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' }
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
        splitLine: { lineStyle: { color: '#eee' } }
      },
      series: [{
        data: counts,
        type: 'line',
        smooth: true,
        lineStyle: { color: '#667eea', width: 3 },
        areaStyle: { color: 'rgba(102, 126, 234, 0.1)' },
        itemStyle: { color: '#667eea' }
      }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    };
  }

  updatePopularTagsChart() {
    if (!this.mostUsedTags.length) return;

    const data = this.mostUsedTags.map(tag => ({
      name: tag.tag,
      value: tag.count
    }));

    this.popularTagsOptions = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: data,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c}',
          color: '#333'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
    };
  }

  updateActiveUsersChart() {
    if (!this.mostActiveUsers.length) return;

    const names = this.mostActiveUsers.map(user => 
      user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email
    );
    const counts = this.mostActiveUsers.map(user => user.notesCount);

    this.activeUsersOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' }
      },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { 
          color: '#666',
          rotate: 45,
          interval: 0
        },
        axisLine: { lineStyle: { color: '#ddd' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
        splitLine: { lineStyle: { color: '#eee' } }
      },
      series: [{
        data: counts,
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#667eea'
            }, {
              offset: 1, color: '#764ba2'
            }]
          }
        },
        barWidth: '60%'
      }],
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true }
    };
  }

  updateUsageDistributionChart() {
    if (!this.stats.totalNotes || !this.stats.totalUsers) return;

    const avgNotesPerUser = Math.round(this.stats.totalNotes / this.stats.totalUsers);
    const data = [
      { name: 'Active Users', value: this.stats.activeUsers || 0 },
      { name: 'Inactive Users', value: (this.stats.totalUsers || 0) - (this.stats.activeUsers || 0) }
    ];

    this.usageDistributionOptions = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' }
      },
      series: [{
        type: 'pie',
        radius: '70%',
        data: data,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c}\n({d}%)',
          color: '#333'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      color: ['#4facfe', '#f093fb']
    };
  }

  // Helper methods
  getNotesThisWeek(): number {
    if (!this.notesPerDay.length) return 0;
    return this.notesPerDay.slice(-7).reduce((sum, day) => sum + day.count, 0);
  }

  getTotalTagUsage(): number {
    return this.mostUsedTags.reduce((sum, tag) => sum + tag.count, 0);
  }

  getArchivePercentage(): number {
    if (!this.stats.totalNotes || !this.stats.archivedNotes) return 0;
    return Math.round((this.stats.archivedNotes / this.stats.totalNotes) * 100);
  }

  getTopUser(): string {
    if (!this.mostActiveUsers.length) return 'No data';
    const topUser = this.mostActiveUsers[0];
    return topUser.firstName && topUser.lastName 
      ? `${topUser.firstName} ${topUser.lastName}` 
      : topUser.email || 'Unknown';
  }

  getMostPopularTag(): string {
    if (!this.mostUsedTags.length) return 'No tags';
    return this.mostUsedTags[0].tag || 'Unknown';
  }

  getGrowthRate(): number {
    if (!this.notesPerDay.length) return 0;
    const thisWeek = this.getNotesThisWeek();
    const lastWeek = this.notesPerDay.slice(-14, -7).reduce((sum, day) => sum + day.count, 0);
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }

  getEngagementRate(): number {
    if (!this.stats.totalUsers || !this.stats.activeUsers) return 0;
    return Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100);
  }

  // Leaderboard helper methods
  getMedal(rank: number): string {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[rank] || '';
  }

  getUserInitials(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getUserName(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.username) {
      return user.username;
    }
    return user.email || 'Unknown User';
  }

  getSortedUsersByNotes(): any[] {
    return [...this.mostActiveUsers].sort((a, b) => b.notesCount - a.notesCount);
  }

  getProgressPercentage(notesCount: number): number {
    if (!this.mostActiveUsers.length) return 0;
    const maxNotes = Math.max(...this.mostActiveUsers.map(u => u.notesCount));
    return maxNotes > 0 ? (notesCount / maxNotes) * 100 : 0;
  }

  // Helper method to check if current user is admin
  isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'admin';
  }
}
