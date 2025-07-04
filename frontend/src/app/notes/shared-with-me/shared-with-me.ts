import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from '../../shared/services/notes.service';
import { AuthService } from '../../shared/services/auth.service';
import { Note } from '../../shared/models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-with-me',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shared-container">
      <div class="page-header">
        <h1>🔄 Shared With Me</h1>
        <p>Notes that others have shared with you</p>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <p>Loading shared notes...</p>
      </div>

      <div *ngIf="!isLoading" class="notes-grid">
        <div class="note-card" *ngFor="let note of sharedNotes" (click)="viewNote(note._id)">
          <div class="note-header">
            <h3>{{ note.title }}</h3>
            <div class="note-badges">
              <span class="badge permission-badge" [ngClass]="'permission-' + getPermission(note)">
                {{ getPermission(note) }}
              </span>
            </div>
            <div class="note-actions" (click)="$event.stopPropagation()">
              <button class="btn-icon" (click)="editNote(note._id)" *ngIf="getPermission(note) === 'write'" title="Edit note">✏️</button>
              <button class="btn-icon" (click)="viewNote(note._id)" title="View note">👁️</button>
            </div>
          </div>
          <p class="note-content">{{ getPreviewText(note.content) }}</p>
          <div class="note-tags" *ngIf="note.tags && note.tags.length > 0">
            <span class="tag" *ngFor="let tag of note.tags">#{{ tag }}</span>
          </div>
          <div class="note-meta">
            <small>Shared by: {{ note.owner.firstName }} {{ note.owner.lastName }} ({{ note.owner.email }})</small>
            <br>
            <small>{{ note.updatedAt | date:'short' }}</small>
          </div>
        </div>

        <div class="empty-state" *ngIf="sharedNotes.length === 0">
          <div class="empty-icon">📭</div>
          <h3>No shared notes yet</h3>
          <p>When someone shares a note with you, it will appear here.</p>
        </div>
      </div>
    </div>

    <!-- View Note Modal -->
    <div class="modal-overlay" *ngIf="showViewModal" (click)="closeViewModal()">
      <div class="modal view-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedNote?.title }}</h3>
          <div class="modal-badges">
            <span class="badge permission-badge" [ngClass]="'permission-' + getPermission(selectedNote!)">
              {{ getPermission(selectedNote!) }}
            </span>
          </div>
          <button class="btn-close" (click)="closeViewModal()">×</button>
        </div>
        <div class="modal-content">
          <div class="note-full-content">
            <div class="note-meta-info" *ngIf="selectedNote">
              <div class="meta-item">
                <span class="meta-label">Shared by:</span>
                <span class="meta-value">{{ selectedNote.owner.firstName }} {{ selectedNote.owner.lastName }} ({{ selectedNote.owner.email }})</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Permission:</span>
                <span class="meta-value">
                  <span class="badge permission-badge" [ngClass]="'permission-' + getPermission(selectedNote)">
                    {{ getPermission(selectedNote) }}
                  </span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Last updated:</span>
                <span class="meta-value">{{ selectedNote.updatedAt | date:'medium' }}</span>
              </div>
              <div class="meta-item" *ngIf="selectedNote.tags && selectedNote.tags.length > 0">
                <span class="meta-label">Tags:</span>
                <div class="tags-display">
                  <span class="tag" *ngFor="let tag of selectedNote.tags">#{{ tag }}</span>
                </div>
              </div>
            </div>
            <div class="content-section">
              <h4>Content:</h4>
              <div class="content-display">{{ selectedNote?.content }}</div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="closeViewModal()">Close</button>
            <button class="btn btn-primary" (click)="editNote(selectedNote!._id)" *ngIf="getPermission(selectedNote!) === 'write'">Edit Note</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './shared-with-me.scss'
})
export class SharedWithMeComponent implements OnInit {
  sharedNotes: Note[] = [];
  isLoading = false;
  showViewModal = false;
  selectedNote: Note | null = null;

  constructor(
    private notesService: NotesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSharedNotes();
  }

  loadSharedNotes() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading = true;
    this.notesService.getSharedNotes().subscribe({
      next: (response) => {
        this.sharedNotes = response.notes || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading shared notes:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  getPermission(note: Note): string {
    const currentUserId = this.authService.currentUserValue?._id;
    const shareInfo = note.sharedWith?.find(share => share.user._id === currentUserId);
    return shareInfo?.permission || 'read';
  }

  getPreviewText(content: string): string {
    if (!content) return '';
    const maxLength = 120;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  editNote(noteId: string) {
    this.router.navigate(['/notes/edit', noteId]);
  }

  viewNote(noteId: string) {
    const note = this.sharedNotes.find(n => n._id === noteId);
    if (note) {
      this.selectedNote = note;
      this.showViewModal = true;
    }
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedNote = null;
  }
}
