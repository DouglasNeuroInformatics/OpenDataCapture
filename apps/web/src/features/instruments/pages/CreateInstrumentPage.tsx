import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';

import { FormCreator } from '../components/FormCreator';

export const CreateInstrumentPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t('instruments.createInstrument.pageTitle')} />
      <FormCreator />
    </div>
  );
};

export default CreateInstrumentPage;
