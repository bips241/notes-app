import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../shared/services/notes.service';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Note, User } from '../../shared/models/interfaces';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './notes-list.html',
  styleUrl: './notes-list.scss'
})
export class NotesListComponent implements OnInit, OnDestroy {
  notes: Note[] = [];
  isLoading = false;
  showShareModal = false;
  showViewModal = false;
  selectedNote: Note | null = null;
  viewingNote: Note | null = null;
  shareForm = {
    userEmail: '',
    permission: 'read' as 'read' | 'write'
  };
  
  // User search functionality
  userSearchTerm = '';
  searchResults: User[] = [];
  showSearchDropdown = false;
  isSearching = false;
  
  // View modal enhancements
  isFullscreen = false;
  contentMode: 'formatted' | 'raw' = 'formatted';
  
  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    private notesService: NotesService,
    public authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    // Setup search debouncing using the user service
    this.subscriptions.push(
      this.userService.searchUsersWithDebounce(this.searchSubject.asObservable()).subscribe({
        next: (response) => {
          this.searchResults = response.users || [];
          this.showSearchDropdown = this.searchResults.length > 0;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.isSearching = false;
          this.searchResults = [];
          this.showSearchDropdown = false;
        }
      })
    );
  }

  ngOnInit() {
    this.loadNotes();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotes() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    console.log('🔄 Loading notes for user:', this.authService.currentUserValue);
    this.isLoading = true;
    this.notesService.getNotes().subscribe({
      next: (response) => {
        console.log('✅ Notes response received:', response);
        this.notes = response.notes || [];
        this.isLoading = false;
        console.log(`📝 Loaded ${this.notes.length} notes`);
        console.log('📋 Note titles:', this.notes.map(n => ({ id: n._id, title: n.title })));
      },
      error: (error) => {
        console.error('❌ Error loading notes:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  editNote(noteId: string) {
    this.router.navigate(['/notes/edit', noteId]);
  }

  deleteNote(noteId: string) {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(noteId).subscribe({
        next: () => {
          console.log('Note deleted successfully');
          this.loadNotes(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting note:', error);
          alert('Failed to delete note. Please try again.');
        }
      });
    }
  }

  shareFromView(note: Note) {
    // Close the view modal first
    this.closeViewModal();
    // Then open the share modal
    this.shareNote(note);
  }

  shareNote(note: Note) {
    // Check if current user is the owner or has write permission
    const isOwner = note.owner._id === this.authService.currentUserValue?._id;
    const hasWritePermission = note.sharedWith?.some(share => 
      share.user._id === this.authService.currentUserValue?._id && 
      share.permission === 'write'
    );
    
    if (!isOwner && !hasWritePermission) {
      alert('You can only share notes you own or have write permission to.');
      return;
    }
    
    this.selectedNote = note;
    this.shareForm.userEmail = '';
    this.shareForm.permission = 'read';
    this.showShareModal = true;
  }

  closeShareModal() {
    this.showShareModal = false;
    this.selectedNote = null;
    this.userSearchTerm = '';
    this.searchResults = [];
    this.showSearchDropdown = false;
  }

  shareNoteWithUser(event: Event) {
    event.preventDefault();
    if (!this.selectedNote || !this.shareForm.userEmail) {
      alert('Please enter a valid email address.');
      return;
    }

    // First, find the user by email
    this.userService.getUserByEmail(this.shareForm.userEmail).subscribe({
      next: (response) => {
        const user = response.user;
        if (this.selectedNote) {
          this.notesService.shareNote(this.selectedNote._id, user._id, this.shareForm.permission).subscribe({
            next: (response) => {
              alert('Note shared successfully!');
              this.loadNotes(); // Refresh to show updated share info
              this.closeShareModal();
            },
            error: (error) => {
              console.error('Error sharing note:', error);
              alert(`Failed to share note: ${error.error?.message || 'Unknown error'}`);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error finding user:', error);
        alert('User not found with that email address.');
      }
    });
  }

  hasSharedUsers(note: Note | null): boolean {
    return !!(note?.sharedWith && note.sharedWith.length > 0);
  }

  getSharedCount(note: Note): number {
    return note.sharedWith?.length || 0;
  }

  testSharedNotesAPI() {
    console.log('🧪 Testing shared notes API...');
    this.notesService.getSharedNotes().subscribe({
      next: (response) => {
        console.log('✅ Shared notes API works!', response);
        alert(`Shared notes API success! Found ${response.notes?.length || 0} shared notes`);
      },
      error: (error) => {
        console.error('❌ Shared notes API error:', error);
        alert('Shared notes API failed: ' + error.message);
      }
    });
  }

  removeShare(userId: string) {
    if (!this.selectedNote) return;
    
    // Check if current user is the owner
    if (this.selectedNote.owner._id !== this.authService.currentUserValue?._id) {
      alert('You can only remove access from notes you own.');
      return;
    }
    
    if (confirm('Are you sure you want to remove access for this user?')) {
      this.notesService.removeShare(this.selectedNote._id, userId).subscribe({
        next: () => {
          alert('Access removed successfully!');
          this.loadNotes(); // Refresh to show updated share info
          
          // Update the selected note to reflect the change immediately
          if (this.selectedNote) {
            this.selectedNote.sharedWith = this.selectedNote.sharedWith.filter(
              share => share.user._id !== userId
            );
          }
        },
        error: (error) => {
          console.error('Error removing share:', error);
          if (error.status === 403 || error.status === 401) {
            alert('You do not have permission to remove this share.');
          } else if (error.status === 404) {
            alert('Note or user not found.');
          } else {
            alert('Failed to remove access. Please try again.');
          }
        }
      });
    }
  }

  removeShareFromView(userId: string) {
    if (!this.viewingNote) return;
    
    // Check if current user is the owner
    if (this.viewingNote.owner._id !== this.authService.currentUserValue?._id) {
      alert('You can only remove access from notes you own.');
      return;
    }
    
    if (confirm('Are you sure you want to remove access for this user?')) {
      this.notesService.removeShare(this.viewingNote._id, userId).subscribe({
        next: () => {
          alert('Access removed successfully!');
          this.loadNotes(); // Refresh to show updated share info
          
          // Update the viewing note to reflect the change immediately
          if (this.viewingNote) {
            this.viewingNote.sharedWith = this.viewingNote.sharedWith.filter(
              share => share.user._id !== userId
            );
          }
        },
        error: (error) => {
          console.error('Error removing share:', error);
          if (error.status === 403 || error.status === 401) {
            alert('You do not have permission to remove this share.');
          } else if (error.status === 404) {
            alert('Note or user not found.');
          } else {
            alert('Failed to remove access. Please try again.');
          }
        }
      });
    }
  }

  getPreviewText(content: string): string {
    if (!content) return '';
    const maxLength = 120;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  viewNote(note: Note) {
    this.viewingNote = note;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewingNote = null;
    this.isFullscreen = false;
    this.contentMode = 'formatted';
  }

  editFromView(noteId: string | undefined) {
    if (noteId) {
      this.closeViewModal();
      this.editNote(noteId);
    }
  }

  // Enhanced view modal methods
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  toggleContentMode() {
    this.contentMode = this.contentMode === 'formatted' ? 'raw' : 'formatted';
  }

  copyNoteContent() {
    if (this.viewingNote) {
      const content = `${this.viewingNote.title}\n\n${this.viewingNote.content}`;
      navigator.clipboard.writeText(content).then(() => {
        // You could add a toast notification here
        console.log('Note content copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy content: ', err);
      });
    }
  }

  printNote() {
    if (this.viewingNote) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = `
          <html>
            <head>
              <title>${this.viewingNote.title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                .meta { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .meta-item { margin: 5px 0; }
                .meta-label { font-weight: bold; }
                .content { margin-top: 20px; line-height: 1.6; }
                .tags { margin-top: 10px; }
                .tag { background: #e3f2fd; padding: 3px 8px; margin: 2px; border-radius: 12px; font-size: 0.8em; }
                pre { white-space: pre-wrap; word-wrap: break-word; }
              </style>
            </head>
            <body>
              <h1>${this.viewingNote.title}</h1>
              <div class="meta">
                <div class="meta-item"><span class="meta-label">Created:</span> ${new Date(this.viewingNote.createdAt).toLocaleString()}</div>
                <div class="meta-item"><span class="meta-label">Updated:</span> ${new Date(this.viewingNote.updatedAt).toLocaleString()}</div>
                ${this.viewingNote.owner._id !== this.authService.currentUserValue?._id 
                  ? `<div class="meta-item"><span class="meta-label">Owner:</span> ${this.viewingNote.owner.firstName} ${this.viewingNote.owner.lastName}</div>`
                  : ''}
                ${this.viewingNote.tags && this.viewingNote.tags.length > 0 
                  ? `<div class="meta-item"><span class="meta-label">Tags:</span> ${this.viewingNote.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>`
                  : ''}
              </div>
              <div class="content">
                <h2>Content:</h2>
                <pre>${this.viewingNote.content}</pre>
              </div>
            </body>
          </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }

  getFormattedContent(content: string | undefined): string {
    if (!content) return '';
    
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1
      .replace(/^## (.*$)/gm, '<h2>$1</h2>') // H2
      .replace(/^### (.*$)/gm, '<h3>$1</h3>') // H3
      .replace(/^- (.*$)/gm, '<li>$1</li>') // List items
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>'); // Wrap lists
  }

  getUserDisplayName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email;
  }

  getUserInitials(user: any): string {
    if (!user || !user.firstName || !user.lastName) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  // Missing methods referenced in template
  archiveNote(noteId: string) {
    if (confirm('Are you sure you want to archive this note?')) {
      this.notesService.archiveNote(noteId).subscribe({
        next: () => {
          console.log('Note archived successfully');
          this.loadNotes();
        },
        error: (error) => {
          console.error('Error archiving note:', error);
        }
      });
    }
  }

  onUserEmailInput() {
    this.userSearchTerm = this.shareForm.userEmail;
    this.isSearching = true;
    this.searchSubject.next(this.userSearchTerm);
  }

  hideSearchDropdown() {
    // Increased delay to allow click events to process properly
    setTimeout(() => {
      this.showSearchDropdown = false;
      this.searchResults = [];
    }, 300);
  }

  selectUser(user: User) {
    this.shareForm.userEmail = user.email;
    this.userSearchTerm = user.email;
    this.showSearchDropdown = false;
    this.searchResults = [];
  }

  preventDropdownClose(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Permission checking methods for template
  canEditNote(note: Note): boolean {
    return note.owner._id === this.authService.currentUserValue?._id || 
           (note.sharedWith && note.sharedWith.some(share => 
             share.user._id === this.authService.currentUserValue?._id && 
             share.permission === 'write'));
  }

  canShareNote(note: Note): boolean {
    return note.owner._id === this.authService.currentUserValue?._id;
  }

  canDeleteNote(note: Note): boolean {
    return note.owner._id === this.authService.currentUserValue?._id;
  }

  canArchiveNote(note: Note): boolean {
    return note.owner._id === this.authService.currentUserValue?._id;
  }

  isNoteOwner(note: Note | null): boolean {
    return note?.owner._id === this.authService.currentUserValue?._id;
  }

  isNotNoteOwner(note: Note | null): boolean {
    return note?.owner._id !== this.authService.currentUserValue?._id;
  }
}
