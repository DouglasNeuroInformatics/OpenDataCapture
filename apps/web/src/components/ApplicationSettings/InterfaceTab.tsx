import React from 'react';

import { Checkbox, Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';

import { SelectTableColorMode } from '@/components/SelectTableColorMode';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useAppStore } from '@/store';
import type { GroupSwitcherPosition } from '@/store/types';
import { LANGUAGE_LABELS, LANGUAGES } from '@/utils/language';
import { sortByLabel } from '@/utils/sort-by-label';

import { SettingsCard } from './SettingsCard';

import type { AutosaveSetupState } from './types';

type InterfaceTabProps = {
  autosave: AutosaveSetupState;
};

export const InterfaceTab = ({ autosave }: InterfaceTabProps) => {
  const { t } = useTranslation();
  const { data: setupState } = useSetupStateQuery();
  const groupSwitcherPosition = useAppStore((store) => store.groupSwitcherPosition);
  const setGroupSwitcherPosition = useAppStore((store) => store.setGroupSwitcherPosition);

  const { activeLanguages } = setupState;

  // Rebuilt by filtering LANGUAGES rather than appending, so the stored order is always the
  // canonical one — the first entry is what a user stranded by a deactivation falls back to,
  // and it must not depend on the order an admin happened to click.
  const toggleLanguage = (language: Language) => {
    const updated = LANGUAGES.filter((code) => {
      return code === language ? !activeLanguages.includes(code) : activeLanguages.includes(code);
    });
    const [first, ...rest] = updated;
    if (!first) {
      return;
    }
    autosave({ activeLanguages: [first, ...rest] });
  };

  return (
    <SettingsCard
      sections={[
        {
          content: (
            <SelectTableColorMode
              value={setupState.tableColorMode}
              onSelect={(tableColorMode) => autosave({ tableColorMode })}
            />
          ),
          label: t({
            en: 'Coloured Text In Tables',
            es: 'Texto de color en las tablas',
            fr: 'Texte coloré dans les tableaux'
          })
        },
        {
          content: (
            <Select
              value={groupSwitcherPosition}
              onValueChange={(value) => setGroupSwitcherPosition(value as GroupSwitcherPosition)}
            >
              <Select.Trigger className="w-45 shrink-0" data-testid="group-switcher-position-select">
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
          ),
          label: t({
            en: 'Group Switcher Position',
            es: 'Posición del selector de grupo',
            fr: 'Position du sélecteur de groupe'
          })
        },
        {
          content: (
            <React.Fragment>
              <p className="text-muted-foreground text-sm">
                {t({
                  en: 'The languages users of this instance can read the interface in.',
                  es: 'Los idiomas en los que los usuarios de esta instancia pueden leer la interfaz.',
                  fr: "Les langues dans lesquelles les utilisateurs de cette instance peuvent lire l'interface."
                })}
              </p>
              <div className="flex flex-col gap-3" data-testid="active-languages">
                {sortByLabel(LANGUAGES.map((language) => ({ label: t(LANGUAGE_LABELS[language]), language }))).map(
                  ({ label, language }) => {
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
                          {label}
                        </label>
                      </div>
                    );
                  }
                )}
              </div>
            </React.Fragment>
          ),
          label: t({ en: 'Languages', es: 'Idiomas', fr: 'Langues' })
        }
      ]}
    />
  );
};
