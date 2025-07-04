import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, PaginationResponse, UsersResponse, SharingRestrictionsResponse } from '../models/interfaces';
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
  } = {}): Observable<UsersResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);

    return this.http.get<UsersResponse>(
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

  getSharingRestrictions(userId: string): Observable<SharingRestrictionsResponse> {
    return this.http.get<SharingRestrictionsResponse>(
      `${this.apiUrl}/users/${userId}/sharing-restrictions`,
      this.getHttpOptions()
    );
  }

  addSharingRestriction(userId: string, restrictedUserId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/users/${userId}/sharing-restrictions`,
      { restrictedUserId },
      this.getHttpOptions()
    );
  }

  removeSharingRestriction(userId: string, restrictedUserId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/users/${userId}/sharing-restrictions/${restrictedUserId}`,
      this.getHttpOptions()
    );
  }

  searchUsers(searchTerm: string): Observable<UsersResponse> {
    return this.getAllUsers({ search: searchTerm, limit: 10 });
  }
}
