import { useState } from 'react';

import { Stepper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { formInstrumentSchema } from '@open-data-capture/common/instrument';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import { merge } from 'lodash';
import { useTranslation } from 'react-i18next';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import type { PartialDeep } from 'type-fest';

import { ContentForm } from './ContentForm';
import { InfoForm } from './InfoForm';
import { ReviewForm } from './ReviewForm';

export type FormCreatorProps = {
  onSubmit: (form: FormInstrument) => void;
};

export const FormCreator = ({ onSubmit }: FormCreatorProps) => {
  const notifications = useNotificationsStore();
  const [state, setState] = useState<PartialDeep<FormInstrument>>({});
  const { t } = useTranslation('instruments');

  const handleSubmit = () => {
    const result = formInstrumentSchema.safeParse(state);
    if (!result.success) {
      notifications.addNotification({ message: t('create.errors.validationFailed'), type: 'error' });
      return;
    }
    onSubmit(result.data);
  };

  const updateState = (data: PartialDeep<FormInstrument>) => {
    setState((prevState) => {
      return merge(structuredClone(prevState), data);
    });
  };

  return (
    <Stepper
      steps={[
        {
          element: <InfoForm onSubmit={updateState} />,
          icon: <HiOutlineQuestionMarkCircle />,
          label: t('create.steps.info')
        },
        {
          element: <ContentForm onSubmit={updateState} />,
          icon: <HiOutlineQuestionMarkCircle />,
          label: t('create.steps.content')
        },
        {
          element: <ReviewForm onSubmit={handleSubmit} />,
          icon: <HiOutlineQuestionMarkCircle />,
          label: t('create.steps.review')
        }
      ]}
    />
  );
};
