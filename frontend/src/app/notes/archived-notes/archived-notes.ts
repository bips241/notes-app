import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../shared/services/notes.service';
import { AuthService } from '../../shared/services/auth.service';
import { Note } from '../../shared/models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-archived-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="archived-container">
      <div class="page-header">
        <h1>🗃️ Archived Notes</h1>
        <p>Notes that have been archived</p>
      </div>

      <div class="search-section">
        <input 
          type="text" 
          placeholder="Search archived notes..." 
          class="search-input"
          [(ngModel)]="searchTerm"
          (input)="onSearchChange()"
        />
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <p>Loading archived notes...</p>
      </div>

      <div *ngIf="!isLoading" class="archived-notes">
        <div class="note-card" *ngFor="let note of archivedNotes" (click)="viewNote(note)">
          <div class="note-header">
            <h3>{{ note.title }}</h3>
            <div class="note-badges">
              <span class="badge archived-badge">📦 Archived</span>
              <span class="badge" *ngIf="note.owner._id !== authService.currentUserValue?._id">📤 Shared with me</span>
              <span class="badge" *ngIf="hasSharedUsers(note)">🔗 Shared ({{ getSharedCount(note) }})</span>
            </div>
            <div class="note-actions" (click)="$event.stopPropagation()">
              <button class="btn-icon" (click)="unarchiveNote(note._id)" title="Unarchive note" *ngIf="canUnarchiveNote(note)">📤</button>
              <button class="btn-icon" (click)="editNote(note._id)" title="Edit note" *ngIf="canEditNote(note)">✏️</button>
              <button class="btn-icon" (click)="deleteNote(note._id)" title="Delete note" *ngIf="canDeleteNote(note)">🗑️</button>
            </div>
          </div>
          <p class="note-content">{{ getPreviewText(note.content) }}</p>
          <div class="note-tags" *ngIf="note.tags && note.tags.length > 0">
            <span class="tag" *ngFor="let tag of note.tags">#{{ tag }}</span>
          </div>
          <div class="note-meta">
            <small>Archived: {{ note.updatedAt | date:'short' }}</small>
          </div>
        </div>

        <div class="empty-state" *ngIf="archivedNotes.length === 0">
          <div class="empty-icon">📭</div>
          <h3>No archived notes</h3>
          <p>When you archive notes, they will appear here.</p>
          <button class="btn btn-primary" (click)="goToNotes()">
            📝 Go to My Notes
          </button>
        </div>
      </div>
    </div>

    <!-- View Note Modal -->
    <div class="modal-overlay" *ngIf="showViewModal" (click)="closeViewModal()">
      <div class="modal view-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ viewingNote?.title }}</h3>
          <div class="modal-badges">
            <span class="badge archived-badge">📦 Archived</span>
          </div>
          <button class="btn-close" (click)="closeViewModal()">×</button>
        </div>
        <div class="modal-content">
          <div class="note-full-content">
            <div class="note-meta-info" *ngIf="viewingNote">
              <div class="meta-item">
                <span class="meta-label">Created:</span>
                <span class="meta-value">{{ viewingNote.createdAt | date:'medium' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Archived:</span>
                <span class="meta-value">{{ viewingNote.updatedAt | date:'medium' }}</span>
              </div>
              <div class="meta-item" *ngIf="viewingNote.owner._id !== authService.currentUserValue?._id">
                <span class="meta-label">Owner:</span>
                <span class="meta-value">{{ viewingNote.owner.firstName }} {{ viewingNote.owner.lastName }}</span>
              </div>
              <div class="meta-item" *ngIf="viewingNote.tags && viewingNote.tags.length > 0">
                <span class="meta-label">Tags:</span>
                <div class="tags-display">
                  <span class="tag" *ngFor="let tag of viewingNote.tags">#{{ tag }}</span>
                </div>
              </div>
            </div>
            <div class="content-section">
              <h4>Content:</h4>
              <div class="content-display">{{ viewingNote?.content }}</div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="closeViewModal()">Close</button>
            <button class="btn btn-primary" (click)="editFromView(viewingNote._id)" *ngIf="viewingNote && canEditNote(viewingNote)">Edit Note</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './archived-notes.scss'
})
export class ArchivedNotesComponent implements OnInit {
  archivedNotes: Note[] = [];
  isLoading = false;
  showViewModal = false;
  viewingNote: Note | null = null;
  searchTerm = '';
  searchTimeout: any;

  constructor(
    private notesService: NotesService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadArchivedNotes();
  }

  loadArchivedNotes() {
    if (!this.authService.isAuthenticated()) {
      console.log('⚠️ User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

    console.log('📂 Loading archived notes...');
    this.isLoading = true;
    const options = this.searchTerm ? { search: this.searchTerm } : {};
    
    this.notesService.getArchivedNotes(options).subscribe({
      next: (response) => {
        console.log('✅ Archived notes loaded:', response);
        this.archivedNotes = response.notes || [];
        this.isLoading = false;
        console.log(`📊 Found ${this.archivedNotes.length} archived notes`);
      },
      error: (error) => {
        console.error('❌ Error loading archived notes:', error);
        this.isLoading = false;
        if (error.status === 401) {
          console.log('🔐 Unauthorized, redirecting to login');
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadArchivedNotes();
    }, 300);
  }

  getPreviewText(content: string): string {
    if (!content) return '';
    const maxLength = 120;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  hasSharedUsers(note: Note): boolean {
    return !!(note?.sharedWith && note.sharedWith.length > 0);
  }

  getSharedCount(note: Note): number {
    return note.sharedWith?.length || 0;
  }

  viewNote(note: Note) {
    this.viewingNote = note;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewingNote = null;
  }

  editNote(noteId: string) {
    this.router.navigate(['/notes/edit', noteId]);
  }

  editFromView(noteId: string | undefined) {
    if (noteId) {
      this.closeViewModal();
      this.editNote(noteId);
    }
  }

  unarchiveNote(noteId: string) {
    console.log('🚀 Attempting to unarchive note:', noteId);
    if (confirm('Are you sure you want to unarchive this note?')) {
      this.notesService.unarchiveNote(noteId).subscribe({
        next: (response) => {
          console.log('✅ Note unarchived successfully:', response);
          // Show success message
          alert('Note unarchived successfully! It will now appear in your regular notes.');
          // Refresh the archived notes list
          this.loadArchivedNotes();
        },
        error: (error) => {
          console.error('❌ Error unarchiving note:', error);
          const errorMessage = error.error?.message || error.message || 'Unknown error occurred';
          alert(`Failed to unarchive note: ${errorMessage}`);
        }
      });
    }
  }

  deleteNote(noteId: string) {
    if (confirm('Are you sure you want to permanently delete this note?')) {
      this.notesService.deleteNote(noteId).subscribe({
        next: () => {
          this.loadArchivedNotes(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting note:', error);
          alert('Failed to delete note. Please try again.');
        }
      });
    }
  }

  goToNotes() {
    this.router.navigate(['/notes']);
  }

  // Permission checking methods
  canEditNote(note: Note): boolean {
    return note.owner._id === this.authService.currentUserValue?._id || 
           (note.sharedWith && note.sharedWith.some(share => 
             share.user._id === this.authService.currentUserValue?._id && 
             share.permission === 'write'));
  }

  canDeleteNote(note: Note): boolean {
    return note.owner._id === this.authService.currentUserValue?._id;
  }

  canUnarchiveNote(note: Note): boolean {
    return note.owner._id === this.authService.currentUserValue?._id || 
           (note.sharedWith && note.sharedWith.some(share => 
             share.user._id === this.authService.currentUserValue?._id && 
             share.permission === 'write'));
  }

  isNoteOwner(note: Note | null): boolean {
    return note?.owner._id === this.authService.currentUserValue?._id;
  }

  isNotNoteOwner(note: Note | null): boolean {
    return note?.owner._id !== this.authService.currentUserValue?._id;
  }
}
