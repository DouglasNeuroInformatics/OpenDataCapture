import { translateInstrumentSummary } from '@opendatacapture/instrument-utils';
import { $InstrumentSummary } from '@opendatacapture/schemas/instrument';
import type { InstrumentKind } from '@opendatacapture/schemas/instrument';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

type UseInstrumentSummariesQueryOptions<TKind extends InstrumentKind> = {
  params?: {
    kind?: TKind;
    subjectId?: string;
  };
};

export function useInstrumentSummariesQuery<TKind extends InstrumentKind>({
  params
}: UseInstrumentSummariesQueryOptions<TKind> = {}) {
  const { i18n } = useTranslation();
  return useSuspenseQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/summaries', {
        params
      });
      const summaries = await $InstrumentSummary.array().parseAsync(response.data);
      return summaries.map((summary) => translateInstrumentSummary(summary, i18n.resolvedLanguage ?? 'en'));
    },
    queryKey: ['instrument-summaries', params?.kind]
  });
}
