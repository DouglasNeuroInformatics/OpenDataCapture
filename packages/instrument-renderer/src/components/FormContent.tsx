import { useContext } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Form, StepperContext } from '@douglasneuroinformatics/ui/legacy';
import type { AnyUnilingualFormInstrument } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';
import type { Promisable } from 'type-fest';

export type FormContentProps = {
  instrument: AnyUnilingualFormInstrument;
  onSubmit: (data: FormDataType) => Promisable<void>;
};

export const FormContent = ({ instrument, onSubmit }: FormContentProps) => {
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation('core');

  const handleSubmit = async (data: FormDataType) => {
    await onSubmit(data);
    updateIndex('increment');
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">{t('steps.questions')}</h3>
      <Form
        content={instrument.content}
        data-cy="form-content"
        validationSchema={instrument.validationSchema}
        onSubmit={(data) => void handleSubmit(data)}
      />
    </div>
  );
};
