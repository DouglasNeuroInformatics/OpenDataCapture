import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Language } from '@opendatacapture/schemas/core';
import type { Language } from '@opendatacapture/schemas/core';

import { LANGUAGE_LABELS, LANGUAGES } from '@/utils/language';

export type LanguageSelectProps = {
  'data-testid'?: string;
  id?: string;
  onChange: (language: Language) => void;
  /** The languages to offer; defaults to every language the application supports. */
  options?: readonly Language[];
  value: Language;
};

/** Picks the language a message is composed or sent in. */
export const LanguageSelect = ({
  'data-testid': testId,
  id,
  onChange,
  options = LANGUAGES,
  value
}: LanguageSelectProps) => {
  const { t } = useTranslation();
  return (
    <Select value={value} onValueChange={(next) => onChange($Language.parse(next))}>
      <Select.Trigger className="w-[180px]" data-testid={testId} id={id}>
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
