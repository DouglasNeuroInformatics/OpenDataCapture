import { createMongoAbility } from '@casl/ability';
import type { JwtPayload } from '@open-data-capture/common/auth';
import type { BaseAppAbility } from '@open-data-capture/common/core';
import type { Group } from '@open-data-capture/common/group';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

import { useActiveVisitStore } from './active-visit-store';

export type CurrentUser = {
  ability: BaseAppAbility;
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
    useActiveVisitStore.setState({ activeVisit: null });
    set({ accessToken: null, currentUser: null });
  },
  setAccessToken: (accessToken) => {
    const { groups, permissions, ...rest } = jwtDecode<JwtPayload>(accessToken);
    const ability = createMongoAbility<BaseAppAbility>(permissions);
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
