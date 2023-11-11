'use client';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { FormStepper } from '@open-data-capture/react-core/components';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';

export type FormAssignmentProps = {
  id: string;
  instrumentBundle: string;
};

export const FormAssignment = ({ id, instrumentBundle }: FormAssignmentProps) => {
  const instrument = evaluateInstrument<FormInstrument>(instrumentBundle);
  const form = translateFormInstrument(instrument, 'en');

  const handleSubmit = async (data: FormDataType) => {
    const response = await fetch(`/api/assignments/${id}`, {
      body: JSON.stringify({
        record: {
          data
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PATCH'
    });
    console.log(response.status);
  };

  return (
    <div>
      <h3 className="my-8 text-center text-xl font-bold">{form.details.title}</h3>
      <FormStepper form={form} onSubmit={handleSubmit} />
    </div>
  );
};
