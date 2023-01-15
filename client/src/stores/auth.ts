import axios from 'axios';
import { AuthTokens, JwtPayload, LoginCredentials, authTokensSchema, jwtPayloadSchema } from 'common';
import jwtDecode from 'jwt-decode';
import { z } from 'zod';
import { create } from 'zustand';

type CurrentUser = Omit<JwtPayload, 'refreshToken'>;

export interface AuthStore {
  accessToken: string | null;
  currentUser: CurrentUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  login: async (credentials) => {
    let authTokens: AuthTokens;
    let currentUser: CurrentUser;
    try {
      const response = await axios.post('/api/auth/login', credentials);
      authTokens = await authTokensSchema.parseAsync(response.data);
      currentUser = await jwtPayloadSchema.parseAsync(jwtDecode(authTokens.accessToken));
    } catch (error) {
      if (error instanceof Response) {
        throw new Error(`${error.status}: ${error.statusText}`);
      } else if (error instanceof z.ZodError) {
        throw new Error('Failed to validate current user schema', {
          cause: error
        });
      }
      throw new Error('An unknown error occurred');
    }
    set({ accessToken: authTokens.accessToken, currentUser });
  },
  currentUser: null,
  logout: () => set({ accessToken: null, currentUser: null })
}));
