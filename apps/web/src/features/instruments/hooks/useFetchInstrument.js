import { useEffect, useState } from 'react';
import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { useFetch } from '@/hooks/useFetch';
/**
 * Returns the instrument with the provided identifier in the current language
 * @param identifier - the instrument's identifier
 */
export function useFetchInstrument(identifier) {
  var notifications = useNotificationsStore();
  var _a = useTranslation(),
    t = _a.t,
    i18n = _a.i18n;
  var _b = useState(i18n.resolvedLanguage),
    preferredLanguage = _b[0],
    setPreferredLanguage = _b[1];
  useEffect(
    function () {
      setPreferredLanguage(i18n.resolvedLanguage);
    },
    [i18n.resolvedLanguage]
  );
  var instrument = useFetch(
    '/v1/instruments/forms/'.concat(identifier, '?lang=').concat(preferredLanguage),
    [preferredLanguage],
    {
      onError: function (error) {
        setPreferredLanguage(function (prevLanguage) {
          if (prevLanguage === 'en') {
            return 'fr';
          }
          return 'en';
        });
        notifications.addNotification({ type: 'warning', message: t('instruments.fetchInstrument.notFound') });
        console.error(error);
      }
    }
  ).data;
  return instrument;
}
