import React, { useContext } from 'react';

import { FormInstrument } from '@ddcp/types';
import { FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { Form } from '@douglasneuroinformatics/ui';

import { StepperContext } from '@/context/StepperContext';

export type FormQuestionsProps<T extends FormInstrumentData> = {
  instrument: FormInstrument<T>;
  onSubmit: (data: T) => void;
}

export const FormQuestions = <T extends FormInstrumentData>({
  instrument: { content, validationSchema },
  onSubmit
}: FormQuestionsProps<T>) => {
  const { updateIndex } = useContext(StepperContext);

  const handleSubmit = (data: T) => {
    onSubmit(data);
    updateIndex('increment');
  };

  return (
    <div>
      <Form content={content} validationSchema={validationSchema} onSubmit={handleSubmit} />
    </div>
  );
};
