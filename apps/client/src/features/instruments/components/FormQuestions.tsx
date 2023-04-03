import React, { useContext } from 'react';

import { FormInstrument } from '@ddcp/common';

import { Form, FormValues } from '@/components';
import { StepperContext } from '@/context/StepperContext';

export interface FormQuestionsProps {
  instrument: FormInstrument;
  onSubmit: (data: FormValues) => void;
}

export const FormQuestions = ({ instrument: { content, validationSchema }, onSubmit }: FormQuestionsProps) => {
  const { updateIndex } = useContext(StepperContext);
  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    updateIndex('increment');
  };

  return (
    <div>
      <Form content={content} validationSchema={validationSchema} onSubmit={handleSubmit} />
    </div>
  );
};
