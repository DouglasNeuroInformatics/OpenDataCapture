import { createMongoAbility } from '@casl/ability';
import type { AppAbility, Group, JwtPayload } from '@open-data-capture/types';
import jwtDecode from 'jwt-decode';
import { create } from 'zustand';

import { useActiveSubjectStore } from './active-subject-store';

export type CurrentUser = {
  ability: AppAbility;
} & Omit<JwtPayload, 'permissions'>;

export type AuthStore = {
  accessToken: null | string;
  currentGroup: Group | null;
  currentUser: CurrentUser | null;
  logout: () => void;
  setAccessToken: (accessToken: string) => void;
  setCurrentGroup: (group: Group) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  currentGroup: null,
  currentUser: null,
  logout: () => {
    useActiveSubjectStore.setState({ activeSubject: null });
    set({ accessToken: null, currentUser: null });
  },
  setAccessToken: (accessToken) => {
    const { groups, permissions, ...rest } = jwtDecode<JwtPayload>(accessToken);
    const ability = createMongoAbility<AppAbility>(permissions);
    set({
      accessToken,
      currentGroup: groups[0],
      currentUser: { ability, groups, ...rest }
    });
  },
  setCurrentGroup: (group) => {
    set({ currentGroup: group });
  }
}));
