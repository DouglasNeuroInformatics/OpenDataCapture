import { useState } from 'react';

import { Stepper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import type { FormInstrument } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import type { PartialDeep } from 'type-fest';

import { InfoForm } from './InfoForm';

export type FormCreatorProps = {
  onSubmit: (form: FormInstrument) => void;
};

export const FormCreator = () => {
  const notifications = useNotificationsStore();
  const [state, setState] = useState<PartialDeep<FormInstrument>>({});
  const { t } = useTranslation('instruments');

  return (
    <Stepper
      steps={[
        {
          element: <InfoForm onSubmit={() => null} />,
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
  );
};
