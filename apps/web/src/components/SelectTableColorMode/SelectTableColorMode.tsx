import { Select } from '@douglasneuroinformatics/libui/components';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $TableColorMode } from '@opendatacapture/schemas/setup';
import type { TableColorMode } from '@opendatacapture/schemas/setup';

import { ColorTag } from '@/components/ColorTagCell';
import { resolveTheme } from '@/utils/chart-theme';
import { getArchiveStatusColor } from '@/utils/tag-colors';

type SelectTableColorModeProps = {
  onSelect: (mode: TableColorMode) => void;
  value: TableColorMode;
};

/** Each option draws real table values in its mode, so the choice is visible rather than named. */
export const SelectTableColorMode = ({ onSelect, value }: SelectTableColorModeProps) => {
  const { t } = useTranslation();
  const [theme] = useTheme();
  const resolvedTheme = resolveTheme(theme);

  const modeLabels: { [K in TableColorMode]: string } = {
    none: t({ en: 'Disabled', es: 'Desactivado', fr: 'Désactivé' }),
    tags: t({ en: 'Tags', es: 'Etiquetas', fr: 'Étiquettes' }),
    text: t({ en: 'Coloured text', es: 'Texto de color', fr: 'Texte coloré' })
  };

  return (
    <Select value={value} onValueChange={(selected) => onSelect($TableColorMode.parse(selected))}>
      <Select.Trigger className="w-80 shrink-0" data-testid="table-color-mode-select">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {$TableColorMode.options.map((mode) => (
            <Select.Item data-testid={`table-color-mode-option-${mode}`} key={mode} value={mode}>
              <span className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-left">{modeLabels[mode]}</span>
                <ColorTag
                  color={getArchiveStatusColor(false, resolvedTheme)}
                  label={t({ en: 'Active', es: 'Activo', fr: 'Actif' })}
                  mode={mode}
                />
                <ColorTag
                  color={getArchiveStatusColor(true, resolvedTheme)}
                  label={t({ en: 'Archived', es: 'Archivado', fr: 'Archivé' })}
                  mode={mode}
                />
              </span>
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
