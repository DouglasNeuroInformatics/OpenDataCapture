import { useContext } from 'react';

import type { FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { Form, StepperContext } from '@douglasneuroinformatics/ui';
import type { FormInstrument } from '@open-data-capture/types';

export type FormQuestionsProps<T extends FormInstrumentData> = {
  instrument: FormInstrument<T>;
  onSubmit: (data: T) => void;
};

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
