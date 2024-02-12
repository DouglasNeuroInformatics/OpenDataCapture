import { LoadingScreen } from '@open-data-capture/react-core';
import { useTranslation } from 'react-i18next';

export const SetupLoadingScreen = () => {
  const { t } = useTranslation('setup');
  return <LoadingScreen subtitle={t('loadingSubtitle')} title={t('loadingTitle')} />;
};
