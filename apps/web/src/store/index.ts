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
        // Carry the persisted flags forward across any future store-version bump so a
        // user's "don't show the tutorial again" choice survives ODC upgrades. Without a
        // migrate function, zustand discards persisted state on a version mismatch, which
        // would make the walkthrough reappear after an update.
        migrate: (persistedState) => persistedState as AppStore,
        name: 'app',
        partialize: (state) => pick(state, ['groupSwitcherPosition', 'isDisclaimerAccepted', 'isWalkthroughComplete']),
        storage: createJSONStorage(() => localStorage),
        version: 1
      }
    )
  )
);
