import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Card, Heading, HoverCard, Input, Select, Separator } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { DEFAULT_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/assignment';
import { MAX_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/setup';
import { createFileRoute } from '@tanstack/react-router';
import { CircleHelpIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { SaveStatus } from '@/components/SaveStatus';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateSetupStateMutation } from '@/hooks/useUpdateSetupStateMutation';
import { useAppStore } from '@/store';
import type { GroupSwitcherPosition } from '@/store/types';

/** libui ships no Switch, so this is hand-rolled — `label` names it for assistive technology. */
const Toggle = ({
  checked,
  label,
  onCheckedChange
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (val: boolean) => void;
}) => (
  <button
    aria-checked={checked}
    aria-label={label}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'}`}
    role="switch"
    type="button"
    onClick={() => onCheckedChange(!checked)}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-slate-200 shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

const SettingSection = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <section className="flex flex-col gap-4 p-6">
    <h3 className="text-base font-semibold">{title}</h3>
    {children}
  </section>
);

/** Returns the whole-day count if `raw` is a valid duration, otherwise null. */
const parseDurationDays = (raw: string): null | number => {
  const parsed = Number(raw);
  const isValid =
    raw.trim() !== '' && Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_ASSIGNMENT_DURATION_DAYS;
  return isValid ? parsed : null;
};

const DURATION_AUTOSAVE_DELAY = 700;

const RouteComponent = () => {
  const { t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();
  const updateSetupStateMutation = useUpdateSetupStateMutation();
  const groupSwitcherPosition = useAppStore((store) => store.groupSwitcherPosition);
  const setGroupSwitcherPosition = useAppStore((store) => store.setGroupSwitcherPosition);

  // `mutate` is referentially stable across renders, so callbacks that depend on `autosave` stay stable too.
  const { mutate } = updateSetupStateMutation;
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'saving'>('idle');
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const autosave = useCallback(
    (data: Parameters<typeof mutate>[0]) => {
      setSaveState('saving');
      mutate(data, {
        onSettled: () => {
          setSaveState('saved');
          clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2000);
        }
      });
    },
    [mutate]
  );

  const uploaderLabel = t({ en: 'Enable Uploader', fr: 'Activer le téléversement' });
  const uploaderEnabled = setupStateQuery.data.isExperimentalFeaturesEnabled ?? false;

  // The input holds its own draft while the admin types. The saved draft is committed after a brief pause,
  // on blur, and on unmount — so navigating away (e.g. clicking a sidebar link) still persists the value.
  // It is resynced whenever the server value changes underneath (a save invalidates and refetches).
  const savedDurationDays = setupStateQuery.data.defaultAssignmentDurationDays ?? DEFAULT_ASSIGNMENT_DURATION_DAYS;
  const [durationDays, setDurationDays] = useState(String(savedDurationDays));
  const [syncedDurationDays, setSyncedDurationDays] = useState(savedDurationDays);
  if (syncedDurationDays !== savedDurationDays) {
    setSyncedDurationDays(savedDurationDays);
    setDurationDays(String(savedDurationDays));
  }

  const durationDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const durationDraftRef = useRef(durationDays);
  durationDraftRef.current = durationDays;
  const savedDurationRef = useRef(savedDurationDays);
  savedDurationRef.current = savedDurationDays;

  const saveDurationIfChanged = useCallback(() => {
    const parsed = parseDurationDays(durationDraftRef.current);
    if (parsed !== null && parsed !== savedDurationRef.current) {
      autosave({ defaultAssignmentDurationDays: parsed });
    }
    return parsed;
  }, [autosave]);

  const flushDurationOnBlur = () => {
    clearTimeout(durationDebounceRef.current);
    if (saveDurationIfChanged() === null) {
      setDurationDays(String(savedDurationRef.current));
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(durationDebounceRef.current);
      saveDurationIfChanged();
    };
  }, [saveDurationIfChanged]);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Application Settings',
            fr: "Paramètres de l'application"
          })}
        </Heading>
      </PageHeader>
      <div className="mx-auto max-w-5xl">
        <Card>
          <Card.Content className="p-0">
            <SettingSection title={t({ en: 'Features', fr: 'Fonctionnalités' })}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{uploaderLabel}</p>
                  <HoverCard>
                    <HoverCard.Trigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors" type="button">
                        <CircleHelpIcon className="h-4 w-4" />
                      </button>
                    </HoverCard.Trigger>
                    <HoverCard.Content className="w-72 text-sm">
                      {t({
                        en: 'When enabled, an upload menu item appears in the sidebar that allows users to upload instrument records directly from data files, bypassing the normal session workflow.',
                        fr: "Lorsqu'elle est activée, un élément de menu Téléversement apparaît dans le menu latéral et permet aux utilisateurs de téléverser des enregistrements d'instruments directement à partir de fichiers de données."
                      })}
                    </HoverCard.Content>
                  </HoverCard>
                </div>
                <Toggle
                  checked={uploaderEnabled}
                  label={uploaderLabel}
                  onCheckedChange={(checked) => autosave({ isExperimentalFeaturesEnabled: checked })}
                />
              </div>
            </SettingSection>
            <Separator />
            <SettingSection title={t({ en: 'Settings', fr: 'Paramètres' })}>
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {t({ en: 'Default Assignment Validity (Days)', fr: 'Validité par défaut des tâches (jours)' })}
                  </p>
                  <HoverCard>
                    <HoverCard.Trigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors" type="button">
                        <CircleHelpIcon className="h-4 w-4" />
                      </button>
                    </HoverCard.Trigger>
                    <HoverCard.Content className="w-72 text-sm">
                      {t({
                        en: 'The number of days a new remote assignment stays valid by default. This only sets the initial expiry date when creating an assignment, which can still be changed for each one.',
                        fr: "Le nombre de jours pendant lesquels une nouvelle tâche à distance reste valide par défaut. Ceci ne définit que la date d'expiration initiale lors de la création d'une tâche, qui peut toujours être modifiée pour chacune."
                      })}
                    </HoverCard.Content>
                  </HoverCard>
                </div>
                <Input
                  className="w-[90px] shrink-0"
                  data-testid="default-assignment-duration-input"
                  inputMode="numeric"
                  max={MAX_ASSIGNMENT_DURATION_DAYS}
                  min={1}
                  type="number"
                  value={durationDays}
                  onBlur={flushDurationOnBlur}
                  onChange={(event) => {
                    setDurationDays(event.target.value);
                    clearTimeout(durationDebounceRef.current);
                    durationDebounceRef.current = setTimeout(saveDurationIfChanged, DURATION_AUTOSAVE_DELAY);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur();
                    }
                  }}
                />
              </div>
            </SettingSection>
            <Separator />
            <SettingSection title={t({ en: 'Preferences', fr: 'Préférences' })}>
              <div className="flex items-center gap-10">
                <p className="text-sm font-medium">
                  {t({ en: 'Group Switcher Position', fr: 'Position du sélecteur de groupe' })}
                </p>
                <Select
                  value={groupSwitcherPosition}
                  onValueChange={(value) => setGroupSwitcherPosition(value as GroupSwitcherPosition)}
                >
                  <Select.Trigger className="w-[180px] shrink-0">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      <Select.Item value="sidebar">{t({ en: 'Sidebar Menu', fr: 'Menu latéral' })}</Select.Item>
                      <Select.Item value="topbar">
                        {t({ en: 'Top Right Corner', fr: 'Coin supérieur droit' })}
                      </Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select>
              </div>
            </SettingSection>
          </Card.Content>
        </Card>
      </div>
      <SaveStatus state={saveState} />
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/admin/settings')({
  component: RouteComponent
});
