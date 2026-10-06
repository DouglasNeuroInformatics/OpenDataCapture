import { merge } from 'lodash-es';

import type { Settings } from '@/models/settings.model';

import type { SettingsSlice, SliceCreator } from '../types';

const defaultSettings: Settings = {
  refreshInterval: 2000
};

export const createSettingsSlice: SliceCreator<SettingsSlice> = (set) => ({
  resetSettings: () => {
    set((state) => {
      state.settings = defaultSettings;
    });
  },
  settings: defaultSettings,
  updateSettings: (updatedSettings) => {
    set((state) => {
      merge(state.settings, updatedSettings);
    });
  }
});
