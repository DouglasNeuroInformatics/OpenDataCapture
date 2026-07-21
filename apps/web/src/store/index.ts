import { pick } from 'lodash-es';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createAuthSlice } from './slices/auth.slice';
import { createConnectivitySlice } from './slices/connectivity.slice';
import { createDisclaimerSlice } from './slices/disclaimer.slice';
import { createPreferencesSlice } from './slices/preferences.slice';
import { createSessionSlice } from './slices/session.slice';
import { createWalkthroughSlice } from './slices/walkthrough.slice';

import type { AppStore } from './types';

/**
 * The slice of the store written to localStorage. Everything else (auth, session, connectivity) is
 * derived from the access token or the network at runtime and must not outlive the tab.
 */
const PERSISTED_KEYS = [
  'groupSwitcherPosition',
  'isDisclaimerAccepted',
  'isWalkthroughComplete',
  'preferredGroupId'
] as const satisfies (keyof AppStore)[];

export const useAppStore = create(
  devtools(
    persist(
      immer<AppStore>((...a) => ({
        ...createAuthSlice(...a),
        ...createConnectivitySlice(...a),
        ...createDisclaimerSlice(...a),
        ...createPreferencesSlice(...a),
        ...createSessionSlice(...a),
        ...createWalkthroughSlice(...a)
      })),
      {
        // Carry the persisted keys forward across any future store-version bump, so a user's "don't
        // show the tutorial again" choice survives an ODC upgrade — without a migrate function
        // zustand discards persisted state whenever the version changes. Picking the known keys
        // rather than passing the blob through means a v2 that drops or renames one only has to
        // amend PERSISTED_KEYS, and stale keys never leak back into the store.
        migrate: (persistedState) => pick(persistedState as Partial<AppStore>, PERSISTED_KEYS) as AppStore,
        name: 'app',
        partialize: (state) => pick(state, PERSISTED_KEYS),
        storage: createJSONStorage(() => localStorage),
        version: 1
      }
    )
  )
);
