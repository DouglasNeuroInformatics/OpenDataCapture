import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createAuthSlice } from './slices/auth.slice';
import { createSessionSlice } from './slices/session.slice';

import type { AppStore } from './types';

export const useAppStore = create(
  devtools(
    immer<AppStore>((...a) => ({
      ...createAuthSlice(...a),
      ...createSessionSlice(...a)
    }))
  )
);
