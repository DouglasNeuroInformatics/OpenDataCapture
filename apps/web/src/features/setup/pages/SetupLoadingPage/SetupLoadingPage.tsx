import React from 'react';

import { LoadingPage } from '@opendatacapture/react-core';
import { useTranslation } from 'react-i18next';

export const SetupLoadingPage = () => {
  const { t } = useTranslation('setup');
  return <LoadingPage subtitle={t('loadingSubtitle')} title={t('loadingTitle')} />;
};
