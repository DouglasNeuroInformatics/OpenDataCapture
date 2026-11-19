import { Label, Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Language } from '@opendatacapture/schemas/core';
import type { Language } from '@opendatacapture/schemas/core';

import type { AdministrationChoice } from '@/utils/administration-choice';
import { LANGUAGE_LABELS } from '@/utils/language';

/** Stands in for "no language", which a Select cannot hold as a value of its own. */
const AUTOMATIC = '__automatic__';

type AdministrationOptionsProps = {
  choice: AdministrationChoice;
  onLanguageChange: (language: Language | undefined) => void;
};

/**
 * The language a remote assignment opens in. The default leaves it unset, so the gateway opens the
 * link in whatever language the subject's browser asks for; picking one pins the link to it.
 */
export const AdministrationOptions = ({ choice, onLanguageChange }: AdministrationOptionsProps) => {
  const { t } = useTranslation();
  if (choice.languageOptions.length < 2) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="administration-language">{t('core.language')}</Label>
      <Select
        value={choice.language ?? AUTOMATIC}
        onValueChange={(next) => onLanguageChange(next === AUTOMATIC ? undefined : $Language.parse(next))}
      >
        <Select.Trigger className="w-full" data-testid="administration-language" id="administration-language">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value={AUTOMATIC}>
              {t({
                en: "The subject's browser language",
                es: 'El idioma del navegador del sujeto',
                fr: 'La langue du navigateur du client'
              })}
            </Select.Item>
            {choice.languageOptions.map((code) => (
              <Select.Item key={code} value={code}>
                {t(LANGUAGE_LABELS[code])}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select>
    </div>
  );
};
