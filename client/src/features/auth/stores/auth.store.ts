import { userRoleOptions } from 'common';
import jwtDecode from 'jwt-decode';
import { z } from 'zod';
import { create } from 'zustand';

const currentUserSchema = z.object({
  username: z.string(),
  role: z.enum(userRoleOptions)
});

type CurrentUser = z.infer<typeof currentUserSchema>;

export interface AuthStore {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => Promise<void>;
  currentUser: CurrentUser | null;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: async (accessToken) => {
    const currentUser = await currentUserSchema.parseAsync(jwtDecode(accessToken));
    set({ accessToken, currentUser });
  },
  currentUser: null,
  logout: () => set({ accessToken: null, currentUser: null })
}));
