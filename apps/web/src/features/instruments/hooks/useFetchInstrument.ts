import { useEffect, useState } from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import type { FormInstrument, Language } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { useFetch } from '@/hooks/useFetch';

/**
 * Returns the instrument with the provided identifier in the current language
 * @param identifier - the instrument's identifier
 */
export function useFetchInstrument(identifier: string) {
  const notifications = useNotificationsStore();
  const { i18n, t } = useTranslation();
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(i18n.resolvedLanguage as Language);

  useEffect(() => {
    setPreferredLanguage(i18n.resolvedLanguage as Language);
  }, [i18n.resolvedLanguage]);

  const { data: instrument } = useFetch<FormInstrument>(
    `/v1/instruments/forms/${identifier}?lang=${preferredLanguage}`,
    [preferredLanguage],
    {
      onError: (error) => {
        setPreferredLanguage((prevLanguage) => {
          if (prevLanguage === 'en') {
            return 'fr';
          }
          return 'en';
        });
        notifications.addNotification({ message: t('instruments.fetchInstrument.notFound'), type: 'warning' });
        console.error(error);
      }
    }
  );

  return instrument;
}
