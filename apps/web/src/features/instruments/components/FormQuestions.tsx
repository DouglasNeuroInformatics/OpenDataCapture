import { useContext } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Form, StepperContext } from '@douglasneuroinformatics/ui';
import type { FormInstrument } from '@open-data-capture/common/instrument';

export type FormQuestionsProps<T extends FormDataType> = {
  instrument: FormInstrument<T>;
  onSubmit: (data: T) => void;
};

export const FormQuestions = <T extends FormDataType>({
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
