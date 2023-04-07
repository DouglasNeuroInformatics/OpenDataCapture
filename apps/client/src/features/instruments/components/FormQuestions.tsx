import React, { useContext } from 'react';

import { FormInstrument, FormInstrumentData } from '@ddcp/common';

import { Form } from '@/components';
import { StepperContext } from '@/context/StepperContext';

export interface FormQuestionsProps<T extends FormInstrumentData> {
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
