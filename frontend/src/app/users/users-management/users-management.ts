import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-container">
      <div class="page-header">
        <h1>👥 Users Management</h1>
        <button class="btn btn-primary">
          ➕ Add New User
        </button>
      </div>

      <div class="search-section">
        <input 
          type="text" 
          placeholder="Search users..." 
          class="search-input"
        />
      </div>

      <div class="users-table">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of mockUsers">
              <td>
                <div class="user-info">
                  <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                  <small>{{ '@' + user.username }}</small>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [class]="'role-' + user.role">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class]="user.isActive ? 'status-active' : 'status-inactive'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.createdAt | date:'short' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon">✏️</button>
                  <button class="btn-icon" [class]="user.isActive ? 'text-red' : 'text-green'">
                    {{ user.isActive ? '🚫' : '✅' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrl: './users-management.scss'
})
export class UsersManagementComponent {
  mockUsers = [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      role: 'user',
      isActive: true,
      createdAt: new Date('2024-01-15')
    },
    {
      _id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-02-20')
    },
    {
      _id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      username: 'bobjohnson',
      email: 'bob@example.com',
      role: 'user',
      isActive: false,
      createdAt: new Date('2024-03-10')
    }
  ];
}
