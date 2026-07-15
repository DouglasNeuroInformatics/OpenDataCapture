import type { PreferencesSlice, SliceCreator } from '../types';

export const createPreferencesSlice: SliceCreator<PreferencesSlice> = (set) => ({
  groupSwitcherPosition: 'sidebar',
  setGroupSwitcherPosition: (groupSwitcherPosition) => {
    set((state) => {
      state.groupSwitcherPosition = groupSwitcherPosition;
    });
  }
});
