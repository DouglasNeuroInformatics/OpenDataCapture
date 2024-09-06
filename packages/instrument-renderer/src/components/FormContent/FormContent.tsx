import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import type { AnyUnilingualFormInstrument, FormInstrument } from '@opendatacapture/runtime-core';
import type { Promisable } from 'type-fest';

export type FormContentProps = {
  instrument: AnyUnilingualFormInstrument;
  onSubmit: (data: FormInstrument.Data) => Promisable<void>;
};

export const FormContent = ({ instrument, onSubmit }: FormContentProps) => {
  return (
    <div className="space-y-6">
      <Heading variant="h4">{instrument.details.title}</Heading>
      <Form
        preventResetValuesOnReset
        content={instrument.content}
        data-cy="form-content"
        initialValues={instrument.initialValues}
        validationSchema={instrument.validationSchema}
        onSubmit={(data) => void onSubmit(data)}
      />
    </div>
  );
};
