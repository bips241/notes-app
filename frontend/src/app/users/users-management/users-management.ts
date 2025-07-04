import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { User, SharingRestrictionsResponse } from '../../shared/models/interfaces';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <div class="page-header">
        <h1>👥 Users Management</h1>
        <button class="btn btn-primary" (click)="refreshUsers()">
          🔄 Refresh Users
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading users...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>{{ error }}</h3>
        <button class="btn btn-primary" (click)="loadUsers()">Try Again</button>
      </div>

      <!-- Users Content -->
      <div *ngIf="!isLoading && !error">
        <div class="search-section">
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            class="search-input"
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
          />
        </div>

        <div class="users-stats">
          <div class="stat-item">
            <span class="stat-label">Total Users:</span>
            <span class="stat-value">{{ pagination?.total || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Active Users:</span>
            <span class="stat-value">{{ getActiveUsersCount() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Showing:</span>
            <span class="stat-value">{{ users.length }}</span>
          </div>
        </div>

        <div class="users-table" *ngIf="users.length > 0">
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
              <tr *ngFor="let user of users">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ getUserInitials(user) }}
                    </div>
                    <div class="user-details">
                      <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                      <small *ngIf="user.username">{{ '@' + user.username }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" [class]="'role-' + user.role">
                    {{ user.role | titlecase }}
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
                    <button 
                      class="btn-icon" 
                      title="Edit User"
                      (click)="editUser(user)">
                      ✏️
                    </button>
                    <button 
                      class="btn-icon" 
                      title="Manage Sharing Restrictions"
                      (click)="manageSharingRestrictions(user)">
                      🔒
                    </button>
                    <button 
                      class="btn-icon" 
                      [class]="user.isActive ? 'text-red' : 'text-green'"
                      [title]="user.isActive ? 'Deactivate User' : 'Activate User'"
                      (click)="toggleUserStatus(user)"
                      [disabled]="updatingUserId === user._id">
                      {{ user.isActive ? '🚫' : '✅' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="users.length === 0 && !isLoading" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No users found</h3>
          <p *ngIf="searchTerm">Try adjusting your search criteria</p>
          <p *ngIf="!searchTerm">No users are registered yet</p>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination && pagination.totalPages > 1">
          <button 
            class="btn btn-secondary"
            [disabled]="pagination.currentPage === 1"
            (click)="goToPage(pagination.currentPage - 1)">
            Previous
          </button>
          
          <span class="pagination-info">
            Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
          </span>
          
          <button 
            class="btn btn-secondary"
            [disabled]="pagination.currentPage === pagination.totalPages"
            (click)="goToPage(pagination.currentPage + 1)">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Sharing Restrictions Modal -->
    <div class="modal-overlay" *ngIf="showSharingModal" (click)="closeSharingModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>🔒 Manage Sharing Restrictions</h3>
          <button class="close-btn" (click)="closeSharingModal()">×</button>
        </div>
        
        <div class="modal-body" *ngIf="selectedUser">
          <div class="user-info-section">
            <div class="user-avatar">
              {{ getUserInitials(selectedUser) }}
            </div>
            <div class="user-details">
              <h4>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</h4>
              <p>{{ selectedUser.email }}</p>
            </div>
          </div>

          <div class="restrictions-section">
            <h5>Current Sharing Restrictions</h5>
            <p class="section-description">
              This user cannot share notes with the following users:
            </p>

            <div *ngIf="loadingRestrictions" class="loading-small">
              <div class="loading-spinner-small"></div>
              <span>Loading restrictions...</span>
            </div>

            <div *ngIf="!loadingRestrictions && restrictedUsers.length === 0" class="empty-restrictions">
              <p>👥 No sharing restrictions set</p>
            </div>

            <div *ngIf="!loadingRestrictions && restrictedUsers.length > 0" class="restricted-users-list">
              <div class="restricted-user" *ngFor="let restrictedUser of restrictedUsers">
                <div class="restricted-user-info">
                  <div class="user-avatar-small">
                    {{ getUserInitials(restrictedUser) }}
                  </div>
                  <div class="user-details-small">
                    <strong>{{ restrictedUser.firstName }} {{ restrictedUser.lastName }}</strong>
                    <small>{{ restrictedUser.email }}</small>
                  </div>
                </div>
                <button 
                  class="btn btn-remove"
                  (click)="removeRestriction(restrictedUser._id)"
                  [disabled]="removingRestrictionId === restrictedUser._id">
                  {{ removingRestrictionId === restrictedUser._id ? '...' : '🗑️' }}
                </button>
              </div>
            </div>
          </div>

          <div class="add-restriction-section">
            <h5>Add New Restriction</h5>
            <div class="add-restriction-form">
              <input 
                type="text" 
                placeholder="Search users by name or email..."
                [(ngModel)]="searchUserTerm"
                (input)="searchUsers()"
                class="search-input-small"
              />
              
              <div *ngIf="searchingUsers" class="loading-small">
                <div class="loading-spinner-small"></div>
                <span>Searching...</span>
              </div>

              <div *ngIf="!searchingUsers && searchResults.length > 0" class="search-results">
                <div class="search-result" *ngFor="let user of searchResults">
                  <div class="user-info-small">
                    <div class="user-avatar-small">
                      {{ getUserInitials(user) }}
                    </div>
                    <div class="user-details-small">
                      <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                      <small>{{ user.email }}</small>
                    </div>
                  </div>
                  <button 
                    class="btn btn-primary-small"
                    (click)="addRestriction(user._id)"
                    [disabled]="addingRestrictionId === user._id || isUserAlreadyRestricted(user._id)">
                    {{ addingRestrictionId === user._id ? '...' : isUserAlreadyRestricted(user._id) ? 'Already Restricted' : 'Add' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './users-management.scss'
})
export class UsersManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  isLoading = false;
  error = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  pagination: any = null;
  updatingUserId: string | null = null;

  // Sharing restrictions properties
  showSharingModal = false;
  selectedUser: User | null = null;
  restrictedUsers: User[] = [];
  loadingRestrictions = false;
  searchUserTerm = '';
  searchResults: User[] = [];
  searchingUsers = false;
  addingRestrictionId: string | null = null;
  removingRestrictionId: string | null = null;

  private searchSubject = new Subject<string>();
  private userSearchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService) {
    // Setup search debouncing
    this.subscriptions.push(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.currentPage = 1;
        this.loadUsers();
      })
    );

    // Setup user search debouncing for restrictions
    this.subscriptions.push(
      this.userSearchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.performUserSearch();
      })
    );
  }

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUsers() {
    this.isLoading = true;
    this.error = '';

    const options = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm.trim() || undefined
    };

    const subscription = this.userService.getAllUsers(options).subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.pagination = {
          currentPage: response.pagination.page || 1,
          totalPages: response.pagination.pages || 1,
          total: response.pagination.total || 0,
          limit: response.pagination.limit || this.pageSize
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  refreshUsers() {
    this.currentPage = 1;
    this.searchTerm = '';
    this.loadUsers();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= (this.pagination?.totalPages || 1)) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  editUser(user: User) {
    // TODO: Implement user editing modal/form
    console.log('Edit user:', user);
    alert('User editing feature will be implemented soon!');
  }

  toggleUserStatus(user: User) {
    if (this.updatingUserId) return;

    this.updatingUserId = user._id;
    const action = user.isActive ? 'deactivate' : 'activate';
    
    const serviceCall = user.isActive 
      ? this.userService.deactivateUser(user._id)
      : this.userService.activateUser(user._id);

    const subscription = serviceCall.subscribe({
      next: (response) => {
        // Update the user status locally
        user.isActive = !user.isActive;
        this.updatingUserId = null;
        console.log(`User ${action}d successfully:`, response.message);
      },
      error: (error) => {
        console.error(`Error ${action}ing user:`, error);
        this.updatingUserId = null;
        alert(`Failed to ${action} user. Please try again.`);
      }
    });

    this.subscriptions.push(subscription);
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

  getActiveUsersCount(): number {
    return this.users.filter(user => user.isActive).length;
  }

  // Sharing restrictions methods
  manageSharingRestrictions(user: User) {
    this.selectedUser = user;
    this.showSharingModal = true;
    this.loadSharingRestrictions();
  }

  closeSharingModal() {
    this.showSharingModal = false;
    this.selectedUser = null;
    this.restrictedUsers = [];
    this.searchUserTerm = '';
    this.searchResults = [];
    this.addingRestrictionId = null;
    this.removingRestrictionId = null;
  }

  loadSharingRestrictions() {
    if (!this.selectedUser) return;

    this.loadingRestrictions = true;
    const subscription = this.userService.getSharingRestrictions(this.selectedUser._id).subscribe({
      next: (response) => {
        this.restrictedUsers = response.restrictedUsers || [];
        this.loadingRestrictions = false;
      },
      error: (error) => {
        console.error('Error loading sharing restrictions:', error);
        this.loadingRestrictions = false;
        alert('Failed to load sharing restrictions. Please try again.');
      }
    });

    this.subscriptions.push(subscription);
  }

  searchUsers() {
    if (!this.searchUserTerm.trim()) {
      this.searchResults = [];
      return;
    }
    this.userSearchSubject.next(this.searchUserTerm);
  }

  performUserSearch() {
    if (!this.searchUserTerm.trim()) {
      this.searchResults = [];
      return;
    }

    this.searchingUsers = true;
    const subscription = this.userService.getAllUsers({
      search: this.searchUserTerm,
      limit: 10
    }).subscribe({
      next: (response) => {
        // Filter out the current user and already restricted users
        this.searchResults = (response.users || []).filter(user => 
          user._id !== this.selectedUser?._id && 
          !this.isUserAlreadyRestricted(user._id)
        );
        this.searchingUsers = false;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.searchingUsers = false;
        this.searchResults = [];
      }
    });

    this.subscriptions.push(subscription);
  }

  addRestriction(restrictedUserId: string) {
    if (!this.selectedUser || this.addingRestrictionId) return;

    this.addingRestrictionId = restrictedUserId;
    const subscription = this.userService.addSharingRestriction(
      this.selectedUser._id, 
      restrictedUserId
    ).subscribe({
      next: (response) => {
        console.log('Sharing restriction added:', response.message);
        this.loadSharingRestrictions();
        this.searchUserTerm = '';
        this.searchResults = [];
        this.addingRestrictionId = null;
      },
      error: (error) => {
        console.error('Error adding sharing restriction:', error);
        this.addingRestrictionId = null;
        alert('Failed to add sharing restriction. Please try again.');
      }
    });

    this.subscriptions.push(subscription);
  }

  removeRestriction(restrictedUserId: string) {
    if (!this.selectedUser || this.removingRestrictionId) return;

    this.removingRestrictionId = restrictedUserId;
    const subscription = this.userService.removeSharingRestriction(
      this.selectedUser._id, 
      restrictedUserId
    ).subscribe({
      next: (response) => {
        console.log('Sharing restriction removed:', response.message);
        this.loadSharingRestrictions();
        this.removingRestrictionId = null;
      },
      error: (error) => {
        console.error('Error removing sharing restriction:', error);
        this.removingRestrictionId = null;
        alert('Failed to remove sharing restriction. Please try again.');
      }
    });

    this.subscriptions.push(subscription);
  }

  isUserAlreadyRestricted(userId: string): boolean {
    return this.restrictedUsers.some(user => user._id === userId);
  }
}
