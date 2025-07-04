import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
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

  // Helper method to check if current user has admin privileges
  private requiresAdmin(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role === 'admin';
  }

  getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Observable<UsersResponse> {
    if (!this.requiresAdmin()) {
      throw new Error('Admin privileges required');
    }
    
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
    if (!this.requiresAdmin()) {
      throw new Error('Admin privileges required');
    }
    
    return this.http.put<{ message: string; user: User }>(
      `${this.apiUrl}/users/${id}`,
      userData,
      this.getHttpOptions()
    );
  }

  deactivateUser(id: string): Observable<{ message: string }> {
    if (!this.requiresAdmin()) {
      throw new Error('Admin privileges required');
    }
    
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/users/${id}/deactivate`,
      {},
      this.getHttpOptions()
    );
  }

  activateUser(id: string): Observable<{ message: string }> {
    if (!this.requiresAdmin()) {
      throw new Error('Admin privileges required');
    }
    
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
    if (!this.requiresAdmin()) {
      throw new Error('Admin privileges required');
    }
    
    return this.http.get<SharingRestrictionsResponse>(
      `${this.apiUrl}/users/${userId}/sharing-restrictions`,
      this.getHttpOptions()
    );
  }

  addSharingRestriction(userId: string, restrictedUserId: string): Observable<{ message: string }> {
    if (!this.requiresAdmin()) {
      throw new Error('Admin privileges required');
    }
    
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/users/${userId}/sharing-restrictions`,
      { restrictedUserId },
      this.getHttpOptions()
    );
  }

  removeSharingRestriction(userId: string, restrictedUserId: string): Observable<{ message: string }> {
    if (!this.requiresAdmin()) {
      throw new Error('Admin privileges required');
    }
    
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/users/${userId}/sharing-restrictions/${restrictedUserId}`,
      this.getHttpOptions()
    );
  }

  searchUsers(searchTerm: string): Observable<{ users: User[] }> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('limit', '10');
      
    return this.http.get<{ users: User[] }>(
      `${this.apiUrl}/users/search`,
      { ...this.getHttpOptions(), params }
    );
  }

  searchUsersWithDebounce(searchTerm$: Observable<string>): Observable<{ users: User[] }> {
    return searchTerm$.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only search if the search term has changed
      switchMap(searchTerm => {
        if (!searchTerm || searchTerm.trim().length < 1) {
          return of({ users: [] });
        }
        return this.searchUsers(searchTerm.trim()).pipe(
          catchError(error => {
            console.error('User search error:', error);
            return of({ users: [] });
          })
        );
      })
    );
  }
}
