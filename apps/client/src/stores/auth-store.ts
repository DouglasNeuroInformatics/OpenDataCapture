import { createMongoAbility } from '@casl/ability';
import { AppAbility, Group, JwtPayload } from '@ddcp/common';
import jwtDecode from 'jwt-decode';
import { create } from 'zustand';

export interface CurrentUser extends Omit<JwtPayload, 'permissions'> {
  ability: AppAbility;
}

export interface AuthStore {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  currentUser: CurrentUser | null;
  currentGroup: Group | null;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => {
    const { permissions, ...rest } = jwtDecode<JwtPayload>(accessToken);
    const ability = createMongoAbility<AppAbility>(permissions);
    set({
      accessToken,
      currentUser: { ability, ...rest },
    });
  },
  currentUser: null,
  currentGroup: null,
  logout: () => set({ accessToken: null, currentUser: null })
}));
