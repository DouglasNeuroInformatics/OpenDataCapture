import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useNavigate } from 'react-router-dom';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';

import { UploadSelectTable } from '../components/UploadSelectTable';

export const UploadSelectPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useInstrumentInfoQuery({
    params: {
      kind: 'FORM'
    }
  });

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Select Instrument',
            fr: 'Selectionnez un instrument'
          })}
        </Heading>
      </PageHeader>
      <React.Suspense fallback={<LoadingFallback />}>
        <div>
          <UploadSelectTable
            data={data ?? []}
            onSelect={(instrument) => {
              navigate(`${instrument.id}`);
            }}
          />
        </div>
      </React.Suspense>
    </React.Fragment>
  );
};
