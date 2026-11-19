import { useCallback, useRef, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { SaveStatus } from '@/components/SaveStatus';
import { SectionTabs } from '@/components/SectionTabs';
import { useUpdateSetupStateMutation } from '@/hooks/useUpdateSetupStateMutation';
import { sortByLabel } from '@/utils/sort-by-label';

import { SETTINGS_TABS } from './tabs';

import type { SettingsTabValue } from './tabs';
import type { AutosaveSetupState } from './types';

const useSetupStateAutosave = () => {
  // A failed autosave belongs beside the control the admin changed, not on the router error boundary.
  const { mutate } = useUpdateSetupStateMutation({ throwOnError: false });
  const [saveState, setSaveState] = useState<'error' | 'idle' | 'saved' | 'saving'>('idle');
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // `mutate` is referentially stable across renders, so callbacks that depend on `autosave` stay stable too.
  // A failed save leaves its status showing rather than clearing on a timer: the controls all render
  // from server state, so once the pill is gone nothing else tells the admin their change never landed.
  const autosave: AutosaveSetupState = useCallback(
    (data) => {
      clearTimeout(savedTimerRef.current);
      setSaveState('saving');
      mutate(data, {
        onError: () => setSaveState('error'),
        onSuccess: () => {
          setSaveState('saved');
          savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2000);
        }
      });
    },
    [mutate]
  );

  return { autosave, saveState };
};

type ApplicationSettingsProps = {
  onTabChange: (tab: SettingsTabValue) => void;
  /** Absent for the default tab, which is the first in label order. */
  tab: SettingsTabValue | undefined;
};

export const ApplicationSettings = ({ onTabChange, tab }: ApplicationSettingsProps) => {
  const { t } = useTranslation();
  const { autosave, saveState } = useSetupStateAutosave();

  const tabs = sortByLabel(SETTINGS_TABS.map((entry) => ({ ...entry, label: t(entry.label) })));
  // With no seed, `reduce` returns the first tab typed as present, which `tabs[0]` is not.
  const selectedTab = tab ?? tabs.reduce((first) => first).value;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6" data-testid="application-settings">
      <SectionTabs data-testid="settings-tab" tabs={tabs} value={selectedTab} onValueChange={onTabChange} />
      {/* Every tab stays mounted, so a form not yet saved in one survives a look at another. */}
      {tabs.map((entry) => (
        <div data-testid={`settings-panel-${entry.value}`} hidden={entry.value !== selectedTab} key={entry.value}>
          {entry.saves === 'each-change' ? <entry.Content autosave={autosave} /> : <entry.Content />}
        </div>
      ))}
      <SaveStatus state={saveState} />
    </div>
  );
};
