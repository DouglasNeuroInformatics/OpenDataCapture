import { $InstrumentBundleContainer } from '@open-data-capture/common/instrument';
import type { AnyInstrument, AnyUnilingualInstrument, InstrumentKind } from '@open-data-capture/common/instrument';
import { translateInstrument } from '@open-data-capture/instrument-utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { useInstrumentInterpreter } from './useInstrumentInterpreter';

export const useInstruments = <TKind extends InstrumentKind>({ params }: { params?: { kind?: TKind } } = {}) => {
  const interpreter = useInstrumentInterpreter();
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/bundles', {
        params
      });
      const bundles = await $InstrumentBundleContainer.array().parseAsync(response.data);
      const instruments = await Promise.all(
        bundles.map(async ({ bundle, id }) => {
          const instrument: Extract<AnyInstrument, { kind: TKind }> = await interpreter.interpret(bundle, {
            id,
            kind: params?.kind,
            validate: import.meta.env.DEV
          });
          return translateInstrument(instrument, i18n.resolvedLanguage ?? 'en');
        })
      );
      return instruments as (Extract<AnyUnilingualInstrument, { kind: TKind }> & { id: string })[];
    },
    queryKey: ['instruments', params]
  });
};
