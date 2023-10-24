import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';

// import { FormCreator } from '../components/FormCreator';

export const CreateInstrumentPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t('instruments.createInstrument.pageTitle')} />
      <h1>Create Instrument</h1>
    </div>
  );
};
