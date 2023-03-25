import { JwtPayload } from '@ddcp/common';
import jwtDecode from 'jwt-decode';
import { create } from 'zustand';

export interface AuthStore {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  currentUser: JwtPayload | null;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => {
    const currentUser = jwtDecode<JwtPayload>(accessToken);
    set({ accessToken, currentUser });
  },
  currentUser: null,
  logout: () => set({ accessToken: null, currentUser: null })
}));
