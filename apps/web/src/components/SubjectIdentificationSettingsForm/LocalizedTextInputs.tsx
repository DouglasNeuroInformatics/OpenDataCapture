import { Input, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language, LocalizedString } from '@opendatacapture/schemas/core';

import { LANGUAGE_LABELS } from '@/utils/language';

export type LocalizedTextInputsProps = {
  description?: string;
  /** Each input's id and test id is this followed by the input's language, e.g. `custom-fields-label-en`. */
  idPrefix: string;
  /** Says that the text is required in some language and is written in none. */
  isMissing?: boolean;
  label: string;
  languages: readonly Language[];
  onChange: (value: LocalizedString) => void;
  value: LocalizedString | null | undefined;
};

/**
 * One text input per language. Text in a language not offered here is kept, so turning a language
 * off and back on does not lose what was written in it.
 */
export const LocalizedTextInputs = ({
  description,
  idPrefix,
  isMissing,
  label,
  languages,
  onChange,
  value
}: LocalizedTextInputsProps) => {
  const { t } = useTranslation();
  return (
    <div aria-labelledby={`${idPrefix}-heading`} className="flex flex-col gap-1.5" role="group">
      <p className="text-sm font-medium" id={`${idPrefix}-heading`}>
        {label}
      </p>
      {description && <p className="text-muted-foreground text-xs">{description}</p>}
      {languages.map((language) => (
        <div className="flex items-center gap-3" key={language}>
          <Label
            className="text-muted-foreground w-20 shrink-0 text-xs font-normal"
            htmlFor={`${idPrefix}-${language}`}
          >
            {t(LANGUAGE_LABELS[language])}
          </Label>
          <Input
            autoComplete="off"
            data-testid={`${idPrefix}-${language}`}
            id={`${idPrefix}-${language}`}
            value={value?.[language] ?? ''}
            onChange={(event) => onChange({ ...value, [language]: event.target.value })}
          />
        </div>
      ))}
      {isMissing && (
        <p className="text-destructive text-xs font-medium" data-testid={`${idPrefix}-error`}>
          {t({
            en: 'Enter this in at least one language.',
            es: 'Introdúzcalo en al menos un idioma.',
            fr: 'Saisissez-le dans au moins une langue.'
          })}
        </p>
      )}
    </div>
  );
};
