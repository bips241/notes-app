import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../shared/services/notes.service';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Note } from '../../shared/models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './notes-list.html',
  styleUrl: './notes-list.scss'
})
export class NotesListComponent implements OnInit {
  notes: Note[] = [];
  isLoading = false;
  showShareModal = false;
  selectedNote: Note | null = null;
  shareForm = {
    userEmail: '',
    permission: 'read' as 'read' | 'write'
  };

  constructor(
    private notesService: NotesService,
    public authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading = true;
    this.notesService.getNotes().subscribe({
      next: (response) => {
        this.notes = response.notes || [];
        this.isLoading = false;
        console.log('Loaded notes:', this.notes);
      },
      error: (error) => {
        console.error('Error loading notes:', error);
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
}
