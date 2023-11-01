import type { Language } from '@open-data-capture/common/core';
import { type FormInstrument, formInstrumentBundleSchema } from '@open-data-capture/common/instrument';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { resolveFormInstrument } from '@/utils/translate-instrument';

export function useFormsQuery() {
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: () => {
      return axios.get<FormInstrument>(`/v1/instruments/forms`).then((response) => {
        const result = formInstrumentBundleSchema.array().safeParse(response.data);
        if (!result.success) {
          throw new Error('Failed to parse form instrument bundle', { cause: result.error });
        }
        return result.data.map((form) => resolveFormInstrument(form, i18n.resolvedLanguage as Language));
      });
    },
    queryKey: ['forms'],
    throwOnError: true
  });
}
