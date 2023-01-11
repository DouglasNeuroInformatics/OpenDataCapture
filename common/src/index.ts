// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface JwtPayload {
  username: string;
  role: string; // Fix
  refreshToken?: string;
}

// User
export const userRoles = ['admin', 'user'] as const;

export type UserRole = (typeof userRoles)[number];
