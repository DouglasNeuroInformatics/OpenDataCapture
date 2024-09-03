import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';

export const UploadSelectPage = () => {
  const { t } = useTranslation(['upload', 'core']);

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
