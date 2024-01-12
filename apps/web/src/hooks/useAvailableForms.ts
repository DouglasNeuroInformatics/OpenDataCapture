import type { Language } from '@open-data-capture/common/core';
import { $FormInstrumentSummary, type InstrumentKind } from '@open-data-capture/common/instrument';
import { translateFormSummary } from '@open-data-capture/react-core/utils/translate-instrument';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const useAvailableForms = () => {
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/available', {
        params: {
          kind: 'FORM' satisfies InstrumentKind
        }
      });
      const result = z.array($FormInstrumentSummary).safeParse(response.data);
      if (!result.success) {
        console.error('Failed to parse form instrument summaries', result.error.issues);
        return [];
      }
      return result.data.map((summary) => translateFormSummary(summary, i18n.resolvedLanguage as Language));
    },
    queryKey: ['available-forms', i18n.resolvedLanguage]
  });
};
