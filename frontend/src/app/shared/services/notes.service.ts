import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Note, PaginationResponse, NotesResponse } from '../models/interfaces';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
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

  createNote(note: Partial<Note>): Observable<{ message: string; note: Note }> {
    return this.http.post<{ message: string; note: Note }>(
      `${this.apiUrl}/notes`, 
      note, 
      this.getHttpOptions()
    );
  }

  getNotes(options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    isArchived?: boolean;
  } = {}): Observable<NotesResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);
    if (options.tags && options.tags.length) params = params.set('tags', options.tags.join(','));
    if (typeof options.isArchived === 'boolean') params = params.set('isArchived', options.isArchived.toString());

    return this.http.get<NotesResponse>(
      `${this.apiUrl}/notes`,
      { ...this.getHttpOptions(), params }
    );
  }

  getNoteById(id: string): Observable<{ note: Note }> {
    return this.http.get<{ note: Note }>(
      `${this.apiUrl}/notes/${id}`,
      this.getHttpOptions()
    );
  }

  updateNote(id: string, note: Partial<Note>): Observable<{ message: string; note: Note }> {
    return this.http.put<{ message: string; note: Note }>(
      `${this.apiUrl}/notes/${id}`,
      note,
      this.getHttpOptions()
    );
  }

  deleteNote(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/notes/${id}`,
      this.getHttpOptions()
    );
  }

  shareNote(id: string, userId: string, permission: 'read' | 'write'): Observable<{ message: string; note: Note }> {
    return this.http.post<{ message: string; note: Note }>(
      `${this.apiUrl}/notes/${id}/share`,
      { userId, permission },
      this.getHttpOptions()
    );
  }

  removeShare(noteId: string, userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/notes/${noteId}/share/${userId}`,
      this.getHttpOptions()
    );
  }
}
