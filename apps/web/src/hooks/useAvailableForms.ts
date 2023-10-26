import { formInstrumentSummarySchema } from '@open-data-capture/schemas/form-instrument';
import type { FormInstrumentSummary, Language } from '@open-data-capture/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { resolveFormSummary } from '@/utils/translate-instrument';

export const useAvailableForms = () => {
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: () => {
      return axios.get<FormInstrumentSummary[]>('/v1/instruments/forms/available').then((response) => {
        const result = formInstrumentSummarySchema.array().safeParse(response.data);
        if (!result.success) {
          console.error('Failed to parse form instrument summaries', result.error.issues);
          return [];
        }
        return result.data.map((summary) => resolveFormSummary(summary, i18n.resolvedLanguage as Language));
      });
    },
    queryKey: ['available-forms']
  });
};
