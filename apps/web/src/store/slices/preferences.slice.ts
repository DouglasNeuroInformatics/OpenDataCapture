import type { PreferencesSlice, SliceCreator } from '../types';

export const createPreferencesSlice: SliceCreator<PreferencesSlice> = (set) => ({
  groupSwitcherPosition: 'sidebar',
  // Written by `changeGroup` in the auth slice, read back by `login`.
  preferredGroupId: null,
  setGroupSwitcherPosition: (groupSwitcherPosition) => {
    set((state) => {
      state.groupSwitcherPosition = groupSwitcherPosition;
    });
  }
});
