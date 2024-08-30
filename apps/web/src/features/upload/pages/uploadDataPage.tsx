import { IdentificationForm } from '@/components/IdentificationForm';
import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { Heading } from '@douglasneuroinformatics/libui/components';
import { t } from 'i18next';
import React from 'react';

export const UploadPage = () => {
  const { t } = useTranslation(['datahub', 'core']);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('index.title')}
        </Heading>
      </PageHeader>
      <React.Suspense fallback={<LoadingFallback />}>
        <div></div>
      </React.Suspense>
    </React.Fragment>
  );
};

function useTranslation(arg0: string[]): { t: any } {
  throw new Error('Function not implemented.');
}
