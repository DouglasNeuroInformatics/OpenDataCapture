import { Input, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { HEX_PATTERN } from '../constants';

type ColorFieldProps = {
  /** Used for both the `id`/`htmlFor` and the color input's `aria-label`. */
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Color shown by the native swatch when `value` is not a valid hex. */
  swatchFallback: string;
  value: string;
};

/**
 * A hex color field: a native `<input type="color">` swatch wired to a text
 * `Input`, with an inline validation message. The two inputs drive each other,
 * and an invalid hex surfaces an error (and disables Save upstream).
 */
export const ColorField = ({
  id,
  label,
  onChange,
  placeholder = '#0ea5e9',
  swatchFallback,
  value
}: ColorFieldProps) => {
  const { t } = useTranslation();
  const isInvalid = !HEX_PATTERN.test(value);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          aria-label={id}
          className="border-input h-9 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent"
          type="color"
          value={HEX_PATTERN.test(value) ? value : swatchFallback}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input id={id} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
      {isInvalid && (
        <p className="text-destructive text-xs">
          {t({ en: 'Enter a valid hex color.', fr: 'Entrez une couleur hexadécimale valide.' })}
        </p>
      )}
    </div>
  );
};
