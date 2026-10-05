import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from '@/store';

const initialState = useAppStore.getState();

describe('createPreferencesSlice', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('should place the group switcher in the sidebar and prefer no group by default', () => {
    expect(useAppStore.getState()).toMatchObject({ groupSwitcherPosition: 'sidebar', preferredGroupId: null });
  });

  it('should move the group switcher to the position the user chose', () => {
    useAppStore.getState().setGroupSwitcherPosition('topbar');
    expect(useAppStore.getState().groupSwitcherPosition).toBe('topbar');
  });
});
