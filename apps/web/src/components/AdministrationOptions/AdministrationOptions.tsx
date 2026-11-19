import { Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';

import type { AdministrationChoice } from '@/utils/administration-choice';

import { LanguageSelect } from '../LanguageSelect';

type AdministrationOptionsProps = {
  choice: AdministrationChoice;
  onLanguageChange: (language: Language) => void;
};

export const AdministrationOptions = ({ choice, onLanguageChange }: AdministrationOptionsProps) => {
  const { t } = useTranslation();
  if (!choice.language || choice.languageOptions.length < 2) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="administration-language">{t('core.language')}</Label>
      <LanguageSelect
        data-testid="administration-language"
        id="administration-language"
        options={choice.languageOptions}
        value={choice.language}
        onChange={onLanguageChange}
      />
    </div>
  );
};
