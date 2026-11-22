import { apiClient } from './apiClient';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

// ── API Functions ──────────────────────────────────────────────────────────────

export function registerUser(data: RegisterPayload): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>('/auth/register', data);
}

export function loginUser(data: LoginPayload): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>('/auth/login', data);
}

export function refreshToken(refreshToken: string): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>('/auth/refresh', { refresh_token: refreshToken });
}

export function getProfile(): Promise<UserProfile> {
  return apiClient.get<UserProfile>('/auth/me');
}

export function updateProfile(data: UpdateProfilePayload): Promise<UserProfile> {
  return apiClient.patch<UserProfile>('/auth/me', data);
}

export function changePassword(data: ChangePasswordPayload): Promise<void> {
  return apiClient.post<void>('/auth/change-password', data);
}
