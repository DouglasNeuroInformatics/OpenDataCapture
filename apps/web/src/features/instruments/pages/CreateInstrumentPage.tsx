import type { FormInstrument } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';

import { FormCreator } from '../components/FormCreator';

export const CreateInstrumentPage = () => {
  const { t } = useTranslation('instruments');

  const handleSubmitForm = (data: FormInstrument) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };

  return (
    <div>
      <PageHeader title={t('create.title')} />
      <div className="mx-auto max-w-3xl">
        <FormCreator onSubmit={handleSubmitForm} />
      </div>
    </div>
  );
};
