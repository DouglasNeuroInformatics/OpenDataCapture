import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';

export const ManageInstrumentsPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t('instruments.manageInstruments.pageTitle')} />
    </div>
  );
};

export default ManageInstrumentsPage;
