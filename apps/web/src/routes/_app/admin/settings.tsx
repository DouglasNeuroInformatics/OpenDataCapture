import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Card,
  Checkbox,
  Heading,
  HoverCard,
  Input,
  Select,
  Separator
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { DEFAULT_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/assignment';
import type { Language } from '@opendatacapture/schemas/core';
import { MAX_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/setup';
import { createFileRoute } from '@tanstack/react-router';
import { CircleHelpIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { SaveStatus } from '@/components/SaveStatus';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateSetupStateMutation } from '@/hooks/useUpdateSetupStateMutation';
import { useAppStore } from '@/store';
import type { GroupSwitcherPosition } from '@/store/types';
import { parseDurationDays } from '@/utils/assignment-duration';
import { LANGUAGE_LABELS, LANGUAGES } from '@/utils/language';

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

const DURATION_AUTOSAVE_DELAY = 700;

const RouteComponent = () => {
  const { t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();
  const updateSetupStateMutation = useUpdateSetupStateMutation({ throwOnError: false });
  const groupSwitcherPosition = useAppStore((store) => store.groupSwitcherPosition);
  const setGroupSwitcherPosition = useAppStore((store) => store.setGroupSwitcherPosition);

  // `mutate` is referentially stable across renders, so callbacks that depend on `autosave` stay stable too.
  const { mutate } = updateSetupStateMutation;
  const [saveState, setSaveState] = useState<'error' | 'idle' | 'saved' | 'saving'>('idle');
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // A failed save leaves its status showing rather than clearing on a timer: the controls all render
  // from server state, so once the pill is gone nothing else tells the admin their change never landed.
  const autosave = useCallback(
    (data: Parameters<typeof mutate>[0]) => {
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

  const uploaderLabel = t({ en: 'Enable Uploader', es: 'Activar la carga de datos', fr: 'Activer le téléversement' });
  const uploaderEnabled = setupStateQuery.data.isExperimentalFeaturesEnabled ?? false;

  const activeLanguages = setupStateQuery.data.activeLanguages;

  // Rebuilt by filtering LANGUAGES rather than appending, so the stored order is always the
  // canonical one — the first entry is what a user stranded by a deactivation falls back to,
  // and it must not depend on the order an admin happened to click.
  const toggleLanguage = (language: Language) => {
    const updated = LANGUAGES.filter((code) =>
      code === language ? !activeLanguages.includes(code) : activeLanguages.includes(code)
    );
    const [first, ...rest] = updated;
    if (!first) {
      return;
    }
    autosave({ activeLanguages: [first, ...rest] });
  };

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

  const flushDurationOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    clearTimeout(durationDebounceRef.current);
    const parsed = parseDurationDays(event.target.value);
    if (parsed !== null && parsed !== savedDurationRef.current) {
      setDurationDays(String(parsed));
      autosave({ defaultAssignmentDurationDays: parsed });
    } else if (parsed === null) {
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
            es: 'Configuración de la aplicación',
            fr: "Paramètres de l'application"
          })}
        </Heading>
      </PageHeader>
      <div className="mx-auto max-w-5xl">
        <Card>
          <Card.Content className="p-0">
            <SettingSection title={t({ en: 'Features', es: 'Funcionalidades', fr: 'Fonctionnalités' })}>
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
                        es: 'Cuando está activada, aparece un elemento de menú de carga en la barra lateral que permite a los usuarios cargar registros de instrumentos directamente desde archivos de datos, sin pasar por el flujo de trabajo habitual de las sesiones.',
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
            <SettingSection title={t({ en: 'Settings', es: 'Configuración', fr: 'Paramètres' })}>
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {t({
                      en: 'Default Assignment Validity (Days)',
                      es: 'Validez predeterminada de las tareas (días)',
                      fr: 'Validité par défaut des tâches (jours)'
                    })}
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
                        es: 'El número de días que una nueva tarea remota permanece válida de forma predeterminada. Esto solo define la fecha de vencimiento inicial al crear una tarea, que se puede cambiar en cada caso.',
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
            <SettingSection title={t({ en: 'Languages', es: 'Idiomas', fr: 'Langues' })}>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  {t({
                    en: 'The languages users of this instance can read the interface in.',
                    es: 'Los idiomas en los que los usuarios de esta instancia pueden leer la interfaz.',
                    fr: "Les langues dans lesquelles les utilisateurs de cette instance peuvent lire l'interface."
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {LANGUAGES.map((language) => {
                  const isActive = activeLanguages.includes(language);
                  return (
                    <div className="flex items-center gap-2.5" key={language}>
                      <Checkbox
                        checked={isActive}
                        data-testid={`active-language-${language}`}
                        disabled={isActive && activeLanguages.length === 1}
                        id={`active-language-${language}`}
                        onCheckedChange={() => toggleLanguage(language)}
                      />
                      <label className="text-sm font-medium" htmlFor={`active-language-${language}`}>
                        {t(LANGUAGE_LABELS[language])}
                      </label>
                    </div>
                  );
                })}
              </div>
            </SettingSection>
            <Separator />
            <SettingSection title={t({ en: 'Preferences', es: 'Preferencias', fr: 'Préférences' })}>
              <div className="flex items-center gap-10">
                <p className="text-sm font-medium">
                  {t({
                    en: 'Group Switcher Position',
                    es: 'Posición del selector de grupo',
                    fr: 'Position du sélecteur de groupe'
                  })}
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
                      <Select.Item value="sidebar">
                        {t({ en: 'Sidebar Menu', es: 'Menú lateral', fr: 'Menu latéral' })}
                      </Select.Item>
                      <Select.Item value="topbar">
                        {t({ en: 'Top Right Corner', es: 'Esquina superior derecha', fr: 'Coin supérieur droit' })}
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
