import { useTranslation } from 'react-i18next';

interface LanguageInfo {}

export function useLanguage() {
  const { t } = useTranslation('common');
  
  const inactiveLanguage = Object.keys(languages).find((l) => l !== i18next.resolvedLanguage) as
    | keyof typeof languages
    | undefined;

  t('common:languages');
}
