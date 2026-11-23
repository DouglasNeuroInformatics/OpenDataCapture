import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useAppStore } from '@/store';
import type { AppStore } from '@/store/types';

import { createPreferencesSlice } from '../preferences.slice';

const createStore = () => {
  return create(immer<AppStore>((...a) => ({ ...useAppStore.getState(), ...createPreferencesSlice(...a) })));
};

describe('createPreferencesSlice', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should prefer no group by default, so a first login does not land in an arbitrary one', () => {
    expect(store.getState()).toMatchObject({ preferredGroupId: null });
  });
});
