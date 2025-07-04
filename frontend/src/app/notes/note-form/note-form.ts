import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NotesService } from '../../shared/services/notes.service';
import { AuthService } from '../../shared/services/auth.service';
import { Note } from '../../shared/models/interfaces';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="note-form-container">
      <div class="page-header">
        <h1>✏️ {{ isEditMode ? 'Edit Note' : 'Create New Note' }}</h1>
        <div class="header-actions">
          <button class="btn btn-outline" routerLink="/notes">Cancel</button>
          <button class="btn btn-primary" (click)="saveNote()">{{ isEditMode ? 'Update Note' : 'Save Note' }}</button>
        </div>
      </div>

      <form [formGroup]="noteForm" class="note-form" *ngIf="!isLoading">
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            type="text"
            id="title"
            class="form-control"
            formControlName="title"
            placeholder="Enter note title..."
          />
        </div>

        <div class="form-group">
          <label for="tags">Tags</label>
          <input
            type="text"
            id="tags"
            class="form-control"
            formControlName="tags"
            placeholder="Enter tags separated by commas..."
          />
        </div>

        <div class="form-group">
          <label for="content">Content *</label>
          <textarea
            id="content"
            class="form-control content-editor"
            formControlName="content"
            placeholder="Start writing your note..."
            rows="15"
          ></textarea>
        </div>
      </form>

      <div class="loading-state" *ngIf="isLoading">
        <p>Loading note...</p>
      </div>
    </div>
  `,
  styleUrl: './note-form.scss'
})
export class NoteFormComponent implements OnInit {
  noteForm: FormGroup;
  isEditMode = false;
  noteId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notesService: NotesService,
    private authService: AuthService
  ) {
    this.noteForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      tags: ['']
    });
  }

  ngOnInit() {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.noteId = params['id'];
        this.loadNote();
      }
    });
  }

  loadNote() {
    if (!this.noteId) return;
    
    this.isLoading = true;
    this.notesService.getNoteById(this.noteId).subscribe({
      next: (response) => {
        const note = response.note;
        
        // Check if user has write permission for this note
        const currentUser = this.authService.currentUserValue;
        const isOwner = note.owner._id === currentUser?._id;
        const hasWritePermission = note.sharedWith?.some(share => 
          share.user._id === currentUser?._id && share.permission === 'write'
        );
        
        if (!isOwner && !hasWritePermission) {
          alert('You do not have permission to edit this note.');
          this.router.navigate(['/notes']);
          this.isLoading = false;
          return;
        }
        
        this.noteForm.patchValue({
          title: note.title,
          content: note.content,
          tags: note.tags.join(', ')
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading note:', error);
        alert('Failed to load note. Redirecting to notes list.');
        this.router.navigate(['/notes']);
        this.isLoading = false;
      }
    });
  }

  saveNote() {
    if (this.noteForm.valid) {
      // Check if user is authenticated
      if (!this.authService.isAuthenticated()) {
        alert('You must be logged in to save notes.');
        this.router.navigate(['/auth/login']);
        return;
      }

      const noteData = {
        title: this.noteForm.value.title,
        content: this.noteForm.value.content,
        tags: this.noteForm.value.tags ? this.noteForm.value.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : []
      };
      
      console.log('📝 Note data being sent:', noteData);
      console.log('📝 Form values:', this.noteForm.value);
      console.log('📝 Form valid:', this.noteForm.valid);
      console.log('📝 Form errors:', this.noteForm.errors);
      
      if (this.isEditMode && this.noteId) {
        // Update existing note
        console.log('Updating note with data:', noteData);
        this.notesService.updateNote(this.noteId, noteData).subscribe({
          next: (response) => {
            console.log('Note updated successfully:', response);
            alert('Note updated successfully!');
            this.router.navigate(['/notes']);
          },
          error: (error) => {
            console.error('Error updating note:', error);
            alert(`Failed to update note: ${error.error?.message || error.message || 'Unknown error'}`);
          }
        });
      } else {
        // Create new note
        console.log('Creating note with data:', noteData);
        this.notesService.createNote(noteData).subscribe({
          next: (response) => {
            console.log('Note created successfully:', response);
            alert('Note created successfully!');
            this.router.navigate(['/notes']);
          },
          error: (error) => {
            console.error('Error creating note:', error);
            alert(`Failed to create note: ${error.error?.message || error.message || 'Unknown error'}`);
          }
        });
      }
    } else {
      console.log('Form is invalid:', this.noteForm.errors);
      alert('Please fill in all required fields.');
    }
  }
}
