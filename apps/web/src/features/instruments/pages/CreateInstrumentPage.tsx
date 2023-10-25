import { Stepper } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

import { PageHeader } from '@/components/PageHeader';

import { InstrumentInfoForm, type InstrumentInfoFormData } from '../components/InstrumentInfoForm';

export const CreateInstrumentPage = () => {
  const { t } = useTranslation('instruments');

  const handleSubmitInfo = (data: InstrumentInfoFormData) => {
    console.log(data);
  };

  return (
    <div>
      <PageHeader title={t('create.title')} />
      <div className="mx-auto max-w-3xl">
        <Stepper
          steps={[
            {
              element: <InstrumentInfoForm onSubmit={handleSubmitInfo} />,
              icon: <HiOutlineQuestionMarkCircle />,
              label: t('create.steps.info')
            },
            {
              element: <p>Fields</p>,
              icon: <HiOutlineQuestionMarkCircle />,
              label: t('create.steps.fields')
            },
            {
              element: <p>Review</p>,
              icon: <HiOutlineQuestionMarkCircle />,
              label: t('create.steps.review')
            }
          ]}
        />
      </div>
    </div>
  );
};
