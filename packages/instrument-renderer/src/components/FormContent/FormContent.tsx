import React from 'react';

import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import type { AnyUnilingualFormInstrument, FormTypes } from '@opendatacapture/runtime-core';
import type { Promisable } from 'type-fest';

export type FormContentProps = {
  instrument: AnyUnilingualFormInstrument;
  onSubmit: (data: FormTypes.FormDataType) => Promisable<void>;
};

export const FormContent = ({ instrument, onSubmit }: FormContentProps) => {
  return (
    <div className="space-y-6">
      <Heading variant="h4">{instrument.details.title}</Heading>
      <Form
        preventResetValuesOnReset
        content={instrument.content}
        data-cy="form-content"
        validationSchema={instrument.validationSchema}
        onSubmit={(data) => void onSubmit(data)}
      />
    </div>
  );
};
