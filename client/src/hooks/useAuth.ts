import { AuthTokens, LoginCredentials, userRoleOptions } from 'common';
import jwtDecode from 'jwt-decode';
import { z } from 'zod';
import { create } from 'zustand';

import AuthAPI from '@/api/auth.api';

const currentUserSchema = z.object({
  username: z.string(),
  role: z.enum(userRoleOptions)
});

type CurrentUser = z.infer<typeof currentUserSchema>;

interface Auth {
  accessToken: string | null;
  currentUser: CurrentUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const useAuth = create<Auth>((set) => ({
  accessToken: null,
  login: async (credentials) => {
    let authTokens: AuthTokens;
    let currentUser: CurrentUser;
    try {
      authTokens = await AuthAPI.login(credentials);
      currentUser = await currentUserSchema.parseAsync(jwtDecode(authTokens.accessToken));
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

export default useAuth;
