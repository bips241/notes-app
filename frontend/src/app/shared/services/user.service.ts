import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, PaginationResponse } from '../models/interfaces';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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

  getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Observable<PaginationResponse<User>> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);

    return this.http.get<PaginationResponse<User>>(
      `${this.apiUrl}/users`,
      { ...this.getHttpOptions(), params }
    );
  }

  getUserById(id: string): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(
      `${this.apiUrl}/users/${id}`,
      this.getHttpOptions()
    );
  }

  updateUser(id: string, userData: Partial<User>): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(
      `${this.apiUrl}/users/${id}`,
      userData,
      this.getHttpOptions()
    );
  }

  deactivateUser(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/users/${id}/deactivate`,
      {},
      this.getHttpOptions()
    );
  }

  activateUser(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/users/${id}/activate`,
      {},
      this.getHttpOptions()
    );
  }

  getUserByEmail(email: string): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(
      `${this.apiUrl}/users/search/email?email=${encodeURIComponent(email)}`,
      this.getHttpOptions()
    );
  }
}
