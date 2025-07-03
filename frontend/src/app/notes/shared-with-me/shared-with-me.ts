import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

      <div class="shared-notes">
        <div class="note-card" *ngFor="let note of mockSharedNotes">
          <div class="note-header">
            <h3>{{ note.title }}</h3>
            <div class="permission-badge" [class]="'permission-' + note.permission">
              {{ note.permission }}
            </div>
          </div>
          <p class="note-content">{{ note.content | slice:0:100 }}...</p>
          <div class="note-owner">
            <small>Shared by: {{ note.owner }}</small>
          </div>
        </div>

        <div class="empty-state" *ngIf="mockSharedNotes.length === 0">
          <div class="empty-icon">📭</div>
          <h3>No shared notes yet</h3>
          <p>When someone shares a note with you, it will appear here.</p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './shared-with-me.scss'
})
export class SharedWithMeComponent {
  mockSharedNotes = [
    {
      _id: '1',
      title: 'Team Meeting Notes',
      content: 'Important discussion points from today\'s team meeting...',
      owner: 'John Doe',
      permission: 'read'
    },
    {
      _id: '2',
      title: 'Project Documentation',
      content: 'Comprehensive documentation for the current project...',
      owner: 'Jane Smith',
      permission: 'write'
    }
  ];
}
