import { useTranslation } from 'react-i18next';

import { FormCreator } from '../components/FormCreator';

import { PageHeader } from '@/components';

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
