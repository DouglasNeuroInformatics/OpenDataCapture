import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';

import { InstrumentEditor } from '../components/InstrumentEditor';

export const ManageInstrumentsPage = () => {
  const { t } = useTranslation('instruments');
  return (
    <div className="flex flex-grow flex-col">
      <PageHeader title={t('manage.title')} />
      <InstrumentEditor />
    </div>
  );
};
