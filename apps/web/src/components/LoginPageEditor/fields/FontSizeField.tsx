import { Label, Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { FONT_SIZES } from '@opendatacapture/schemas/setup';

import { FONT_SIZE_DEFAULT } from '../constants';

type FontSizeFieldProps = {
  id: string;
  onChange: (value: null | number) => void;
  value: null | number;
};

/** Font-size dropdown reused by every text section. `null` = use default size. */
export const FontSizeField = ({ id, onChange, value }: FontSizeFieldProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{t({ en: 'Font size', es: 'Tamaño de fuente', fr: 'Taille de police' })}</Label>
      <Select
        value={value === null ? FONT_SIZE_DEFAULT : String(value)}
        onValueChange={(v) => onChange(v === FONT_SIZE_DEFAULT ? null : Number(v))}
      >
        <Select.Trigger className="sm:w-48" id={id}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value={FONT_SIZE_DEFAULT}>
              {t({ en: 'Default', es: 'Predeterminado', fr: 'Par défaut' })}
            </Select.Item>
            {FONT_SIZES.map((s) => (
              <Select.Item key={s} value={String(s)}>{`${s} px`}</Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select>
    </div>
  );
};
