import { $InstrumentSummary } from '@open-data-capture/common/instrument';
import type { InstrumentKind } from '@open-data-capture/common/instrument';
import { translateInstrumentSummary } from '@open-data-capture/instrument-utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export const useInstrumentSummaries = <TKind extends InstrumentKind>({
  params
}: { params?: { kind?: TKind } } = {}) => {
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/summaries', {
        params
      });
      const summaries = await $InstrumentSummary.array().parseAsync(response.data);
      return summaries.map((summary) => translateInstrumentSummary(summary, i18n.resolvedLanguage ?? 'en'));
    },
    queryKey: ['instruments', params]
  });
};
