import { createMongoAbility } from '@casl/ability';
import { AppAbility, Group, JwtPayload } from '@open-data-capture/types';
import jwtDecode from 'jwt-decode';
import { create } from 'zustand';

import { useActiveSubjectStore } from './active-subject-store';

export type CurrentUser = {
  ability: AppAbility;
} & Omit<JwtPayload, 'permissions'>;

export type AuthStore = {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  currentUser: CurrentUser | null;
  currentGroup: Group | null;
  setCurrentGroup: (group: Group) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => {
    const { permissions, groups, ...rest } = jwtDecode<JwtPayload>(accessToken);
    const ability = createMongoAbility<AppAbility>(permissions);
    set({
      accessToken,
      currentUser: { ability, groups, ...rest },
      currentGroup: groups[0]
    });
  },
  currentUser: null,
  currentGroup: null,
  setCurrentGroup: (group) => {
    set({ currentGroup: group });
  },
  logout: () => {
    useActiveSubjectStore.setState({ activeSubject: null });
    set({ accessToken: null, currentUser: null });
  }
}));
