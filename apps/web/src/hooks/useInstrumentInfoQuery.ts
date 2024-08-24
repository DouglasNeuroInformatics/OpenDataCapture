import { translateInstrumentInfo } from '@opendatacapture/instrument-utils';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { $InstrumentInfo } from '@opendatacapture/schemas/instrument';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

type UseInstrumentInfoQueryOptions<TKind extends InstrumentKind> = {
  params?: {
    kind?: TKind;
    subjectId?: string;
  };
};

export function useInstrumentInfoQuery<TKind extends InstrumentKind>({
  params
}: UseInstrumentInfoQueryOptions<TKind> = {}) {
  const { i18n } = useTranslation();
  return useSuspenseQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/info', {
        params
      });
      const infos = await $InstrumentInfo.array().parseAsync(response.data);
      return infos.map((instrument) => translateInstrumentInfo(instrument, i18n.resolvedLanguage ?? 'en'));
    },
    queryKey: ['instrument-info', params?.kind, params?.subjectId, i18n.resolvedLanguage]
  });
}
