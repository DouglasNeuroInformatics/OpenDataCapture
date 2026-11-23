import type { PreferencesSlice, SliceCreator } from '../types';

export const createPreferencesSlice: SliceCreator<PreferencesSlice> = () => ({
  // Written by `changeGroup` in the auth slice, read back by `login`.
  preferredGroupId: null
});
