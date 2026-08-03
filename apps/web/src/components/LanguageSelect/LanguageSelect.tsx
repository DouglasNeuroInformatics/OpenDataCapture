import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { $Language } from '@opendatacapture/schemas/core';
import type { Language } from '@opendatacapture/schemas/core';

import { LANGUAGE_LABELS, LANGUAGES } from '@/utils/language';

export type LanguageSelectProps = {
  className?: string;
  'data-testid'?: string;
  id?: string;
  onChange: (language: Language) => void;
  /** The languages to offer; defaults to every language the application supports. */
  options?: readonly Language[];
  value: Language;
};

/** Picks the language a message is composed or sent in. */
export const LanguageSelect = ({
  className,
  'data-testid': testId,
  id,
  onChange,
  options = LANGUAGES,
  value
}: LanguageSelectProps) => {
  const { t } = useTranslation();
  return (
    <Select value={value} onValueChange={(next) => onChange($Language.parse(next))}>
      <Select.Trigger className={cn('w-[180px]', className)} data-testid={testId} id={id}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {options.map((code) => (
            <Select.Item key={code} value={code}>
              {t(LANGUAGE_LABELS[code])}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
