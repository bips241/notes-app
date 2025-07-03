import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container">
      <div class="page-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Insights and statistics about your notes app</p>
      </div>

      <div class="analytics-grid">
        <div class="analytics-card">
          <h3>👥 Most Active Users</h3>
          <div class="chart-placeholder">
            <div class="user-item" *ngFor="let user of mockActiveUsers">
              <div class="user-info">
                <strong>{{ user.name }}</strong>
                <small>{{ user.notesCount }} notes</small>
              </div>
              <div class="user-bar">
                <div class="bar-fill" [style.width.%]="user.percentage"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <h3>🏷️ Popular Tags</h3>
          <div class="chart-placeholder">
            <div class="tag-cloud">
              <span 
                class="tag-item" 
                *ngFor="let tag of mockPopularTags"
                [style.font-size.px]="12 + (tag.count * 2)"
              >
                #{{ tag.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="analytics-card full-width">
          <h3>📈 Notes Created (Last 7 Days)</h3>
          <div class="chart-placeholder">
            <div class="bar-chart">
              <div class="bar-item" *ngFor="let day of mockNotesPerDay">
                <div class="bar" [style.height.px]="day.count * 10"></div>
                <small>{{ day.date | date:'EEE' }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './analytics-dashboard.scss'
})
export class AnalyticsDashboardComponent implements OnInit {
  mockActiveUsers = [
    { name: 'John Doe', notesCount: 25, percentage: 100 },
    { name: 'Jane Smith', notesCount: 18, percentage: 72 },
    { name: 'Bob Johnson', notesCount: 12, percentage: 48 },
    { name: 'Alice Brown', notesCount: 8, percentage: 32 }
  ];

  mockPopularTags = [
    { name: 'work', count: 15 },
    { name: 'personal', count: 12 },
    { name: 'ideas', count: 8 },
    { name: 'meeting', count: 6 },
    { name: 'project', count: 10 }
  ];

  mockNotesPerDay = [
    { date: new Date('2024-12-25'), count: 5 },
    { date: new Date('2024-12-26'), count: 8 },
    { date: new Date('2024-12-27'), count: 3 },
    { date: new Date('2024-12-28'), count: 12 },
    { date: new Date('2024-12-29'), count: 7 },
    { date: new Date('2024-12-30'), count: 9 },
    { date: new Date('2024-12-31'), count: 15 }
  ];

  ngOnInit() {
    // Will load actual analytics data
  }
}
