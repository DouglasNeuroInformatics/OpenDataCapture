import { formInstrumentSchema } from '@open-data-capture/schemas/instrument';
import type { FormInstrument, Language } from '@open-data-capture/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { resolveFormInstrument } from '@/utils/translate-instrument';

export function useFormQuery(id: string) {
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: () => {
      return axios.get<FormInstrument>(`/v1/instruments/forms/${id}`).then((response) => {
        const result = formInstrumentSchema.safeParse(response.data);
        if (!result.success) {
          throw new Error('Failed to parse form instrument', { cause: result.error });
        }
        return resolveFormInstrument(result.data, i18n.resolvedLanguage as Language);
      });
    },
    queryKey: ['form', id]
  });
}
