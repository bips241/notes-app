import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../shared/services/notes.service';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Note, User } from '../../shared/models/interfaces';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  
  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    private notesService: NotesService,
    public authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    // Setup search debouncing
    this.subscriptions.push(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.searchUsers(searchTerm);
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

  shareNote(note: Note) {
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
    
    if (confirm('Are you sure you want to remove access for this user?')) {
      this.notesService.removeShare(this.selectedNote._id, userId).subscribe({
        next: () => {
          alert('Access removed successfully!');
          this.loadNotes(); // Refresh to show updated share info
          this.closeShareModal();
        },
        error: (error) => {
          console.error('Error removing share:', error);
          alert('Failed to remove access. Please try again.');
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
  }

  editFromView(noteId: string | undefined) {
    if (noteId) {
      this.closeViewModal();
      this.editNote(noteId);
    }
  }

  archiveNote(noteId: string) {
    if (confirm('Are you sure you want to archive this note?')) {
      this.notesService.archiveNote(noteId).subscribe({
        next: () => {
          this.loadNotes(); // Refresh the list
        },
        error: (error) => {
          console.error('Error archiving note:', error);
          alert('Failed to archive note. Please try again.');
        }
      });
    }
  }

  searchUsers(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.searchResults = [];
      this.showSearchDropdown = false;
      return;
    }

    this.isSearching = true;
    this.userService.searchUsers(searchTerm).subscribe({
      next: (response: any) => {
        this.searchResults = response.users || [];
        this.showSearchDropdown = this.searchResults.length > 0;
        this.isSearching = false;
      },
      error: (error: any) => {
        console.error('Error searching users:', error);
        this.isSearching = false;
      }
    });
  }

  onUserEmailInput() {
    this.userSearchTerm = this.shareForm.userEmail;
    this.searchSubject.next(this.userSearchTerm);
  }

  selectUser(user: User) {
    this.shareForm.userEmail = user.email;
    this.userSearchTerm = user.email;
    this.showSearchDropdown = false;
    this.searchResults = [];
  }

  hideSearchDropdown() {
    // Delay hiding to allow click events to process
    setTimeout(() => {
      this.showSearchDropdown = false;
    }, 200);
  }

  getUserDisplayName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email;
  }

  getUserInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }
}
