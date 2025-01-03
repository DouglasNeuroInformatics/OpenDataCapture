import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useAppStore } from '@/store';

import { InstrumentShowcase } from '../components/InstrumentShowcase';

export const AccessibleInstrumentsPage = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const instrumentInfoQuery = useInstrumentInfoQuery();

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('instruments.accessible.title')}
        </Heading>
      </PageHeader>
      <WithFallback
        Component={InstrumentShowcase}
        props={{
          data: currentGroup
            ? instrumentInfoQuery.data?.filter((instrument) => {
                return currentGroup.accessibleInstrumentIds.includes(instrument.id);
              })
            : instrumentInfoQuery.data,
          onSelect: (instrument) => {
            navigate(`/instruments/render/${instrument.id}`, { state: { info: instrument } });
          }
        }}
      />
    </React.Fragment>
  );
};
