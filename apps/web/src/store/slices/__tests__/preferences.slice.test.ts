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

  it('should place the group switcher in the sidebar and prefer no group by default', () => {
    expect(store.getState()).toMatchObject({ groupSwitcherPosition: 'sidebar', preferredGroupId: null });
  });

  it('should move the group switcher to the position the user chose', () => {
    store.getState().setGroupSwitcherPosition('topbar');
    expect(store.getState().groupSwitcherPosition).toBe('topbar');
  });
});
