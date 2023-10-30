import { useContext } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Form, StepperContext } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';

export type FormQuestionsProps = {
  form: FormInstrument<FormDataType, Language>;
  onSubmit: (data: FormDataType) => void;
};

export const FormQuestions = ({ form, onSubmit }: FormQuestionsProps) => {
  const { updateIndex } = useContext(StepperContext);

  const handleSubmit = (data: FormDataType) => {
    onSubmit(data);
    updateIndex('increment');
  };

  return (
    <div>
      <Form content={form.content} validationSchema={form.validationSchema} onSubmit={handleSubmit} />
    </div>
  );
};
