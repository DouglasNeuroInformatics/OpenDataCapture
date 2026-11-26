import { createMongoAbility } from '@casl/ability';
import type { Ability } from '@casl/ability';
import type { TokenPayload } from '@opendatacapture/schemas/auth';
import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';
import { jwtDecode } from 'jwt-decode';
import { isEqual } from 'lodash-es';
import { z } from 'zod/v4';

import type { AuthSlice, CurrentUser, SliceCreator } from '../types';

// The API writes `exp` in whole seconds, so a token that runs to the end of the sign-in can stop up
// to two seconds short of `renewal.endsAt`.
const END_OF_SIGN_IN_TOLERANCE = 2000;

// The claims this file computes with. A token without them could not be counted down, so it is
// refused where it arrives rather than left to produce a deadline of `NaN`.
const $AccessTokenLifetime = z.object({
  exp: z.number(),
  iat: z.number(),
  renewal: z.object({ endsAt: z.number() }).optional()
});

const parseAccessToken = (accessToken: string) => {
  const { groups, permissions, ...claims } = jwtDecode<TokenPayload & { exp?: unknown; iat?: unknown }>(accessToken);
  const { exp: _exp, iat: _iat, renewal: _renewal, ...rest } = claims;
  const { exp, iat, renewal } = $AccessTokenLifetime.parse(claims);
  const ability = createMongoAbility<Ability<[AppAction, AppSubjectName], any>>(permissions);
  const receivedAt = Date.now();
  return {
    accessTokenValidity: {
      // Counted from the token's own lifetime rather than read off `exp`, so a workstation whose
      // clock is wrong still expires the token when the server does.
      expiresAt: receivedAt + (exp - iat) * 1000,
      isRenewable: renewal !== undefined && renewal.endsAt - exp * 1000 >= END_OF_SIGN_IN_TOLERANCE,
      receivedAt
    },
    currentGroup: groups[0],
    currentUser: {
      ability,
      groups,
      ...rest
    }
  };
};

const isUnchangedUser = (
  { ability: currentAbility, ...current }: CurrentUser,
  { ability: nextAbility, ...next }: CurrentUser
) => {
  return isEqual(currentAbility.rules, nextAbility.rules) && isEqual(current, next);
};

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => {
  const accessToken = window.__PLAYWRIGHT_ACCESS_TOKEN__ ?? null;
  const initialState = accessToken ? parseAccessToken(accessToken) : null;

  return {
    accessToken,
    accessTokenValidity: initialState?.accessTokenValidity ?? null,
    changeGroup: (group) => {
      set({ currentGroup: group, currentSession: null, preferredGroupId: group?.id ?? null });
    },
    currentGroup: initialState?.currentGroup ?? null,
    currentUser: initialState?.currentUser ?? null,
    endAccessTokenRenewal: () => {
      set((state) => {
        if (state.accessTokenValidity) {
          state.accessTokenValidity.isRenewable = false;
        }
      });
    },
    expireAccessToken: () => {
      set((state) => {
        if (state.accessTokenValidity) {
          state.accessTokenValidity.expiresAt = Date.now();
          state.accessTokenValidity.isRenewable = false;
        }
      });
    },
    isReauthenticationRequired: false,
    login: (accessToken) => {
      const { accessTokenValidity, currentGroup, currentUser } = parseAccessToken(accessToken);
      // Restore the group last used on this device. A different user signing in on the same browser
      // will not belong to it, in which case we fall back to the first group on their token.
      const { preferredGroupId } = get();
      const preferred = preferredGroupId
        ? currentUser.groups.find((group) => group.id === preferredGroupId)
        : undefined;
      set({
        accessToken,
        accessTokenValidity,
        currentGroup: preferred ?? currentGroup,
        currentUser,
        isReauthenticationRequired: false
      });
    },
    logout: () => {
      window.location.reload();
    },
    reauthenticate: (accessToken) => {
      const next = parseAccessToken(accessToken);
      const { currentGroup, currentSession, currentUser } = get();
      if (currentUser?.id !== next.currentUser.id) {
        return 'differentUser';
      }
      if (next.currentUser.mustResetPassword && !currentUser.mustResetPassword) {
        return 'mustResetPassword';
      }
      // An administrator may be working in a group they do not belong to, which no token of theirs
      // lists, so for them a group missing from the new token is kept as it is. Anyone else has been
      // removed from it, or it was archived, and moves to a group they still have.
      const fallbackGroup = next.currentUser.ability.can('manage', 'all')
        ? currentGroup
        : (next.currentUser.groups[0] ?? null);
      const nextGroup = next.currentUser.groups.find((group) => group.id === currentGroup?.id) ?? fallbackGroup;
      set({
        accessToken,
        accessTokenValidity: next.accessTokenValidity,
        // A token is renewed about once a minute. Handing out the same objects while nothing in them
        // has changed keeps that from re-running every effect and memo keyed on the user or group.
        currentGroup: isEqual(nextGroup, currentGroup) ? currentGroup : nextGroup,
        // A session belongs to one group, as in `changeGroup`.
        currentSession: nextGroup?.id === currentGroup?.id ? currentSession : null,
        currentUser: isUnchangedUser(currentUser, next.currentUser) ? currentUser : next.currentUser,
        isReauthenticationRequired: false
      });
      return 'accepted';
    },
    requireReauthentication: () => {
      set({ isReauthenticationRequired: true });
    }
  };
};
