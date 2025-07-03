import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { AdminGuard } from './shared/guards/admin.guard';

import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { UserDashboardComponent } from './dashboard/user-dashboard/user-dashboard';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard';
import { NotesListComponent } from './notes/notes-list/notes-list';
import { NoteFormComponent } from './notes/note-form/note-form';
import { SharedWithMeComponent } from './notes/shared-with-me/shared-with-me';
import { UsersManagementComponent } from './users/users-management/users-management';
import { AnalyticsDashboardComponent } from './analytics/analytics-dashboard/analytics-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Auth routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  
  // Protected routes
  { 
    path: 'dashboard', 
    component: UserDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: 'notes', 
    component: NotesListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'notes/new', 
    component: NoteFormComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'notes/edit/:id', 
    component: NoteFormComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'shared', 
    component: SharedWithMeComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'users', 
    component: UsersManagementComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: 'analytics', 
    component: AnalyticsDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  
  // Wildcard route
  { path: '**', redirectTo: '/dashboard' }
];
