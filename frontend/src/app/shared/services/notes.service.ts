import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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
    includeShared?: boolean;
  } = {}): Observable<NotesResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);
    if (options.tags && options.tags.length) params = params.set('tags', options.tags.join(','));
    if (typeof options.isArchived === 'boolean') params = params.set('isArchived', options.isArchived.toString());
    if (typeof options.includeShared === 'boolean') params = params.set('includeShared', options.includeShared.toString());

    return this.http.get<NotesResponse>(
      `${this.apiUrl}/notes`,
      { ...this.getHttpOptions(), params }
    );
  }

  getSharedNotes(options: {
    page?: number;
    limit?: number;
  } = {}): Observable<NotesResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());

    return this.http.get<NotesResponse>(
      `${this.apiUrl}/notes/shared`,
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

  archiveNote(noteId: string): Observable<{ message: string; note: Note }> {
    return this.http.patch<{ message: string; note: Note }>(
      `${this.apiUrl}/notes/${noteId}/archive`,
      {},
      this.getHttpOptions()
    );
  }

  unarchiveNote(noteId: string): Observable<{ message: string; note: Note }> {
    console.log('🔄 NotesService: Unarchiving note:', noteId);
    const url = `${this.apiUrl}/notes/${noteId}/unarchive`;
    console.log('📡 API URL:', url);
    
    return this.http.patch<{ message: string; note: Note }>(
      url,
      {},
      this.getHttpOptions()
    ).pipe(
      tap((response: any) => console.log('✅ NotesService: Unarchive response:', response)),
      catchError((error: any) => {
        console.error('❌ NotesService: Unarchive error:', error);
        throw error;
      })
    );
  }

  getArchivedNotes(options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
  } = {}): Observable<NotesResponse> {
    let params = new HttpParams();
    
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);
    if (options.tags && options.tags.length) params = params.set('tags', options.tags.join(','));

    return this.http.get<NotesResponse>(
      `${this.apiUrl}/notes/archived`,
      { ...this.getHttpOptions(), params }
    );
  }
}
