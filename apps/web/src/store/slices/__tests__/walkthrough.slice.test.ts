import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useAppStore } from '@/store';
import type { AppStore } from '@/store/types';

import { createWalkthroughSlice } from '../walkthrough.slice';

const createStore = () => {
  return create(immer<AppStore>((...a) => ({ ...useAppStore.getState(), ...createWalkthroughSlice(...a) })));
};

describe('createWalkthroughSlice', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should start with the walkthrough closed and not yet completed', () => {
    expect(store.getState()).toMatchObject({ isWalkthroughComplete: false, isWalkthroughOpen: false });
  });

  it('should record that the user completed the walkthrough', () => {
    store.getState().setIsWalkthroughComplete(true);
    expect(store.getState().isWalkthroughComplete).toBe(true);
  });

  it('should open the walkthrough on request', () => {
    store.getState().setIsWalkthroughOpen(true);
    expect(store.getState().isWalkthroughOpen).toBe(true);
  });
});
