import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useAppStore } from '@/store';
import type { AppStore } from '@/store/types';

import { createDisclaimerSlice } from '../disclaimer.slice';

const createStore = () =>
  create(immer<AppStore>((...a) => ({ ...useAppStore.getState(), ...createDisclaimerSlice(...a) })));

describe('createDisclaimerSlice', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should start with the disclaimer unaccepted, so it is shown on a first visit', () => {
    expect(store.getState().isDisclaimerAccepted).toBe(false);
  });

  it('should record that the user accepted the disclaimer', () => {
    store.getState().setIsDisclaimerAccepted(true);
    expect(store.getState().isDisclaimerAccepted).toBe(true);
  });
});
