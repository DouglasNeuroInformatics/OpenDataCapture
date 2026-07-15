import { createMongoAbility, PureAbility } from '@casl/ability';
import type { TokenPayload } from '@opendatacapture/schemas/auth';
import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';
import { jwtDecode } from 'jwt-decode';

import type { AuthSlice, SliceCreator } from '../types';

const parseAccessToken = (accessToken: string) => {
  const { groups, permissions, ...rest } = jwtDecode<TokenPayload>(accessToken);
  const ability = createMongoAbility<PureAbility<[AppAction, AppSubjectName], any>>(permissions);
  return {
    currentGroup: groups[0],
    currentUser: {
      ability,
      groups,
      ...rest
    }
  };
};

const PREFERRED_GROUP_KEY = 'odc-preferred-group-id';

export const createAuthSlice: SliceCreator<AuthSlice> = (set) => {
  const accessToken = window.__PLAYWRIGHT_ACCESS_TOKEN__ ?? null;
  const initialState = accessToken ? parseAccessToken(accessToken) : null;

  return {
    accessToken,
    changeGroup: (group) => {
      localStorage.setItem(PREFERRED_GROUP_KEY, group.id);
      set({ currentGroup: group, currentSession: null });
    },
    currentGroup: initialState?.currentGroup ?? null,
    currentUser: initialState?.currentUser ?? null,
    login: (accessToken) => {
      const { currentGroup, currentUser } = parseAccessToken(accessToken);
      const preferredId = localStorage.getItem(PREFERRED_GROUP_KEY);
      const preferred = preferredId ? currentUser.groups.find((g) => g.id === preferredId) : null;
      set({
        accessToken,
        currentGroup: preferred ?? currentGroup,
        currentUser
      });
    },
    logout: () => {
      window.location.reload();
    }
  };
};
