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
      headers: this.authService.getAuthHeaders()
    };
  }

  getDashboardStats(): Observable<{ stats: any }> {
    return this.http.get<{ stats: any }>(
      `${this.apiUrl}/analytics/dashboard`,
      this.getHttpOptions()
    );
  }

  getMostActiveUsers(limit: number = 10): Observable<{ users: any[] }> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ users: any[] }>(
      `${this.apiUrl}/analytics/active-users`,
      { ...this.getHttpOptions(), params }
    );
  }

  getMostUsedTags(limit: number = 10): Observable<{ tags: any[] }> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ tags: any[] }>(
      `${this.apiUrl}/analytics/popular-tags`,
      { ...this.getHttpOptions(), params }
    );
  }

  getNotesPerDay(days: number = 7): Observable<{ data: any[] }> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<{ data: any[] }>(
      `${this.apiUrl}/analytics/notes-per-day`,
      { ...this.getHttpOptions(), params }
    );
  }
}
