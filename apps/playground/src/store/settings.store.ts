import type { Merge } from 'type-fest';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Settings } from '@/models/settings.model';

const DEFAULT_SETTINGS: Settings = {
  refreshInterval: 2000
};

export type SettingsStore = Merge<
  Settings,
  {
    resetSettings: () => void;
    setSettings: (settings: Partial<Settings>) => void;
  }
>;

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
      ...DEFAULT_SETTINGS,
      resetSettings: () => set(DEFAULT_SETTINGS),
      setSettings: (settings) => set(settings)
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
