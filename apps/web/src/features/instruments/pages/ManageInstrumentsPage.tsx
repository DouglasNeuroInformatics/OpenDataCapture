import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';

export const ManageInstrumentsPage = () => {
  const { t } = useTranslation('instruments');
  return (
    <div>
      <PageHeader title={t('manage.title')} />
    </div>
  );
};

