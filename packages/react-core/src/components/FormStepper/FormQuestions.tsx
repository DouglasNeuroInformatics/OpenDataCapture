import { useContext } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Form, StepperContext } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';

export type FormQuestionsProps = {
  form: FormInstrument<FormDataType, Language>;
  onSubmit: (data: FormDataType) => Promise<void>;
};

export const FormQuestions = ({ form, onSubmit }: FormQuestionsProps) => {
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation();

  const handleSubmit = (data: FormDataType) => {
    void onSubmit(data).then(() => {
      updateIndex('increment');
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">{t('steps.questions')}</h3>
      <Form content={form.content} validationSchema={form.validationSchema} onSubmit={handleSubmit} />
    </div>
  );
};
