import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHttpOptions() {
    return {
      headers: this.authService.getAuthHeaders().set('Cache-Control', 'no-cache, no-store, must-revalidate')
        .set('Pragma', 'no-cache')
        .set('Expires', '0')
    };
  }

  getDashboardStats(): Observable<{ stats: any }> {
    // Add cache busting parameter
    const cacheBuster = new HttpParams().set('_t', Date.now().toString());
    return this.http.get<{ stats: any }>(
      `${this.apiUrl}/analytics/dashboard`,
      { ...this.getHttpOptions(), params: cacheBuster }
    );
  }

  getMostActiveUsers(limit: number = 10): Observable<{ users: any[] }> {
    if (!this.isAdmin()) {
      throw new Error('Admin privileges required');
    }
    
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ users: any[] }>(
      `${this.apiUrl}/analytics/active-users`,
      { ...this.getHttpOptions(), params }
    );
  }

  getMostUsedTags(limit: number = 10): Observable<{ tags: any[] }> {
    if (!this.isAdmin()) {
      throw new Error('Admin privileges required');
    }
    
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ tags: any[] }>(
      `${this.apiUrl}/analytics/popular-tags`,
      { ...this.getHttpOptions(), params }
    );
  }

  getNotesPerDay(days: number = 7): Observable<{ data: any[] }> {
    if (!this.isAdmin()) {
      throw new Error('Admin privileges required');
    }
    
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<{ data: any[] }>(
      `${this.apiUrl}/analytics/notes-per-day`,
      { ...this.getHttpOptions(), params }
    );
  }

  // Helper method to check if current user is admin
  private isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'admin';
  }
}
