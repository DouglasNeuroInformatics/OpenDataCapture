import type { Merge } from 'type-fest';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Settings } from '@/models/settings.model';

export type SettingsStore = Merge<
  Settings,
  {
    setRebuildInterval: (rebuildInterval: number) => void;
  }
>;

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
      rebuildInterval: 2000,
      setRebuildInterval: (rebuildInterval) => {
        set({ rebuildInterval });
      }
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
