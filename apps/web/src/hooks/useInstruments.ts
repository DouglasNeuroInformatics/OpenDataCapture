import type { Language } from '@open-data-capture/common/core';
import { $InstrumentBundleContainer, evaluateInstrument } from '@open-data-capture/common/instrument';
import type { Instrument, InstrumentKind, UnilingualInstrument } from '@open-data-capture/common/instrument';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export const useInstruments = <TKind extends InstrumentKind>({ params }: { params?: { kind?: TKind } } = {}) => {
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/bundles', {
        params
      });
      const bundles = await $InstrumentBundleContainer.array().parseAsync(response.data);
      const instruments = await Promise.all(
        bundles.map(async ({ bundle, id }) => {
          const instrument: Extract<Instrument, { kind: TKind }> = await evaluateInstrument(bundle, {
            id,
            kind: params?.kind,
            validate: import.meta.env.DEV
          });
          if (instrument.kind === 'FORM') {
            return translateFormInstrument(
              instrument as Extract<Instrument, { kind: 'FORM' }>,
              i18n.resolvedLanguage as Language
            );
          }
          return instrument;
        })
      );
      return instruments as (Extract<UnilingualInstrument, { kind: TKind }> & { id: string })[];
    },
    queryKey: ['instruments', params]
  });
};
