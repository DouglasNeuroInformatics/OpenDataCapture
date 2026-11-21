import { useEffect } from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { InstrumentShowcase } from '@/components/InstrumentShowcase';
import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useAppStore } from '@/store';
import { selectAdministrableInstruments } from '@/utils/administrable-instruments';

const RouteComponent = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const setupStateQuery = useSetupStateQuery();

  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('[data-testid="instrument-search-bar"] input');
    input?.focus();
  }, []);

  return (
    <div data-testid="accessible-instruments-page">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('instruments.accessible.title')}
        </Heading>
      </PageHeader>
      <WithFallback
        Component={InstrumentShowcase}
        props={{
          allowedLanguages: setupStateQuery.data.activeLanguages,
          data: instrumentInfoQuery.data && selectAdministrableInstruments(instrumentInfoQuery.data, currentGroup),
          onSelect: (instrument, language) => {
            void navigate({
              params: { id: instrument.id },
              search: { language },
              state: { info: instrument },
              to: `/instruments/render/$id`
            });
          }
        }}
      />
    </div>
  );
};

export const Route = createFileRoute('/_app/instruments/accessible-instruments')({
  component: RouteComponent
});
