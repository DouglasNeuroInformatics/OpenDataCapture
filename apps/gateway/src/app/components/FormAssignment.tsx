'use client';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { FormStepper } from '@open-data-capture/react-core/components';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';

export type FormAssignmentProps = {
  instrumentBundle: string;
};

export const FormAssignment = ({ instrumentBundle }: FormAssignmentProps) => {
  const instrument = evaluateInstrument<FormInstrument>(instrumentBundle);
  const form = translateFormInstrument(instrument, 'en');

  const handleSubmit = (data: FormDataType) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };

  return <FormStepper form={form} onSubmit={handleSubmit} />;
};
