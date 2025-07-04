export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isActive: boolean;
  sharingRestrictedUsers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  owner: User;
  sharedWith: SharedNote[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SharedNote {
  user: User;
  permission: 'read' | 'write';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface NotesResponse {
  notes: Note[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface AnalyticsData {
  activeUsers: any[];
  popularTags: any[];
  notesPerDay: any[];
  dashboardStats: any;
}

export interface SharingRestrictionsResponse {
  user: User;
  restrictedUsers: User[];
}
