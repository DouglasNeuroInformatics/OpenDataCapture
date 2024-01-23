import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

/** @deprecated */
export const useAvailableForms = () => {
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: async () => {
      return Promise.resolve([] as any[]);
    },
    queryKey: ['available-forms', i18n.resolvedLanguage]
  });
};
