import React from 'react';

import { Card, Checkbox, Heading, HoverCard, Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import { createFileRoute } from '@tanstack/react-router';
import { CircleHelpIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { SaveStatus } from '@/components/SaveStatus';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateSetupStateMutation } from '@/hooks/useUpdateSetupStateMutation';
import { useAppStore } from '@/store';
import type { GroupSwitcherPosition } from '@/store/types';
import { ALL_LANGUAGES } from '@/utils/languages';

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

const RouteComponent = () => {
  const { t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();
  const updateSetupStateMutation = useUpdateSetupStateMutation();
  const groupSwitcherPosition = useAppStore((store) => store.groupSwitcherPosition);
  const setGroupSwitcherPosition = useAppStore((store) => store.setGroupSwitcherPosition);

  const [saveState, setSaveState] = React.useState<'idle' | 'saved' | 'saving'>('idle');
  const savedTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const autosave = React.useCallback(
    (data: Parameters<typeof updateSetupStateMutation.mutate>[0]) => {
      setSaveState('saving');
      updateSetupStateMutation.mutate(data, {
        onSettled: () => {
          setSaveState('saved');
          clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2000);
        }
      });
    },
    [updateSetupStateMutation]
  );

  const uploaderLabel = t({ en: 'Enable Uploader', es: 'Activar carga de datos', fr: 'Activer le téléversement' });
  const uploaderEnabled = setupStateQuery.data.isExperimentalFeaturesEnabled ?? false;
  const activeLanguages = setupStateQuery.data.activeLanguages ?? ['en', 'fr'];

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
      <div className="mx-auto max-w-4xl">
        <Card>
          <Card.Header>
            <Card.Title className="text-lg font-bold">
              {t({ en: 'Features', es: 'Funcionalidades', fr: 'Fonctionnalités' })}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between">
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
                      es: 'Cuando está activada, aparece un elemento de menú de carga en la barra lateral que permite a los usuarios cargar registros de instrumentos directamente desde archivos de datos, omitiendo el flujo de trabajo normal de sesión.',
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
          </Card.Content>
        </Card>
        <Card className="mt-6">
          <Card.Header>
            <Card.Title className="text-lg font-bold">
              {t({ en: 'Preferences', es: 'Preferencias', fr: 'Préférences' })}
            </Card.Title>
            <Card.Description>
              {t({
                en: 'Saved in this browser and applied immediately. They affect only you, not other users of this instance.',
                es: 'Guardadas en este navegador y aplicadas inmediatamente. Solo le afectan a usted, no a otros usuarios de esta instancia.',
                fr: 'Enregistrées dans ce navigateur et appliquées immédiatement. Elles ne concernent que vous, et non les autres utilisateurs de cette instance.'
              })}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between gap-4">
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
          </Card.Content>
        </Card>
        <Card className="mt-6">
          <Card.Header>
            <Card.Title className="text-lg font-bold">
              {t({ en: 'Languages', es: 'Idiomas', fr: 'Langues' })}
            </Card.Title>
            <Card.Description>
              {t({
                en: 'Select which languages are available across the application. At least one language must remain active.',
                es: 'Seleccione qué idiomas están disponibles en la aplicación. Al menos un idioma debe permanecer activo.',
                fr: "Sélectionnez les langues disponibles dans l'application. Au moins une langue doit rester active."
              })}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col gap-3">
              {Object.entries(ALL_LANGUAGES).map(([code, name]) => {
                const isActive = activeLanguages.includes(code);
                const isLastActive = isActive && activeLanguages.length === 1;
                return (
                  <label className="flex items-center gap-3" key={code}>
                    <Checkbox
                      checked={isActive}
                      disabled={isLastActive}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...activeLanguages, code]
                          : activeLanguages.filter((l) => l !== code);
                        if (updated.length > 0) {
                          autosave({ activeLanguages: updated });
                          if (!updated.includes(i18n.resolvedLanguage)) {
                            i18n.changeLanguage(updated[0]! as Language);
                          }
                        }
                      }}
                    />
                    <span className="text-sm font-medium">{name}</span>
                  </label>
                );
              })}
            </div>
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
