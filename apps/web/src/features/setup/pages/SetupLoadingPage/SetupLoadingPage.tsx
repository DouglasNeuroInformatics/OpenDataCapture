import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { LoadingPage } from '@opendatacapture/react-core';

export const SetupLoadingPage = () => {
  const { t } = useTranslation('setup');
  return <LoadingPage subtitle={t('loadingSubtitle')} title={t('loadingTitle')} />;
};
