import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/models/interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div class="profile-content">
        <!-- Profile Info Section -->
        <div class="profile-section">
          <h2>Profile Information</h2>
          
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" *ngIf="!isLoading">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName"
                formControlName="firstName"
                class="form-control"
                [class.is-invalid]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
              >
              <div class="invalid-feedback" *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched">
                <div *ngIf="profileForm.get('firstName')?.errors?.['required']">First name is required</div>
                <div *ngIf="profileForm.get('firstName')?.errors?.['minlength']">First name must be at least 2 characters</div>
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName"
                formControlName="lastName"
                class="form-control"
                [class.is-invalid]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
              >
              <div class="invalid-feedback" *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched">
                <div *ngIf="profileForm.get('lastName')?.errors?.['required']">Last name is required</div>
                <div *ngIf="profileForm.get('lastName')?.errors?.['minlength']">Last name must be at least 2 characters</div>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email"
                formControlName="email"
                class="form-control"
                [class.is-invalid]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
              >
              <div class="invalid-feedback" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                <div *ngIf="profileForm.get('email')?.errors?.['required']">Email is required</div>
                <div *ngIf="profileForm.get('email')?.errors?.['email']">Please enter a valid email</div>
              </div>
            </div>

            <div class="form-group">
              <label for="username">Username</label>
              <input 
                type="text" 
                id="username"
                formControlName="username"
                class="form-control"
                [class.is-invalid]="profileForm.get('username')?.invalid && profileForm.get('username')?.touched"
              >
              <div class="invalid-feedback" *ngIf="profileForm.get('username')?.invalid && profileForm.get('username')?.touched">
                <div *ngIf="profileForm.get('username')?.errors?.['required']">Username is required</div>
                <div *ngIf="profileForm.get('username')?.errors?.['minlength']">Username must be at least 3 characters</div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="profileForm.invalid || isUpdating"
              >
                {{ isUpdating ? 'Updating...' : 'Update Profile' }}
              </button>
              <button 
                type="button" 
                class="btn btn-outline"
                (click)="resetForm()"
                [disabled]="isUpdating"
              >
                Reset
              </button>
            </div>
          </form>

          <!-- Loading State -->
          <div class="loading-state" *ngIf="isLoading">
            <div class="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>

          <!-- Error State -->
          <div class="error-message" *ngIf="error">
            <div class="alert alert-danger">
              {{ error }}
            </div>
          </div>

          <!-- Success State -->
          <div class="success-message" *ngIf="successMessage">
            <div class="alert alert-success">
              {{ successMessage }}
            </div>
          </div>
        </div>

        <!-- Account Info Section -->
        <div class="profile-section">
          <h2>Account Information</h2>
          <div class="account-info" *ngIf="currentUser">
            <div class="info-item">
              <span class="info-label">Role:</span>
              <span class="info-value">
                <span class="badge" [class.badge-admin]="currentUser.role === 'admin'" [class.badge-user]="currentUser.role === 'user'">
                  {{ currentUser.role === 'admin' ? '👑 Admin' : '👤 User' }}
                </span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Account Status:</span>
              <span class="info-value">
                <span class="badge" [class.badge-active]="currentUser.isActive" [class.badge-inactive]="!currentUser.isActive">
                  {{ currentUser.isActive ? '✅ Active' : '❌ Inactive' }}
                </span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Member Since:</span>
              <span class="info-value">{{ currentUser.createdAt | date:'longDate' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated:</span>
              <span class="info-value">{{ currentUser.updatedAt | date:'medium' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  isUpdating = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.error = null;
    
    this.authService.getProfile().subscribe({
      next: (response: any) => {
        this.currentUser = response.user;
        if (this.currentUser) {
          this.profileForm.patchValue({
            firstName: this.currentUser.firstName,
            lastName: this.currentUser.lastName,
            email: this.currentUser.email,
            username: this.currentUser.username
          });
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = error.error?.message || 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.isUpdating = true;
      this.error = null;
      this.successMessage = null;

      const profileData = this.profileForm.value;
      
      this.authService.updateProfile(profileData).subscribe({
        next: (response: any) => {
          this.successMessage = response.message || 'Profile updated successfully!';
          this.currentUser = response.user;
          this.isUpdating = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (error: any) => {
          this.error = error.error?.message || 'Failed to update profile';
          this.isUpdating = false;
        }
      });
    }
  }

  resetForm() {
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        username: this.currentUser.username
      });
    }
    this.error = null;
    this.successMessage = null;
  }
}
