import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { translateInstrumentInfo } from '@opendatacapture/instrument-utils';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { $InstrumentInfo } from '@opendatacapture/schemas/instrument';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseInstrumentInfoQueryOptions<TKind extends InstrumentKind> = {
  params?: {
    kind?: TKind;
    subjectId?: string;
  };
};

export function useInstrumentInfoQuery<TKind extends InstrumentKind>({
  params
}: UseInstrumentInfoQueryOptions<TKind> = {}) {
  const { resolvedLanguage } = useTranslation();
  return useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/info', {
        params
      });
      const infos = await $InstrumentInfo.array().parseAsync(response.data);
      return infos.map((instrument) => translateInstrumentInfo(instrument, resolvedLanguage ?? 'en'));
    },
    queryKey: ['instrument-info', params?.kind, params?.subjectId, resolvedLanguage]
  });
}
