import React from 'react';

import { ajvResolver } from '@hookform/resolvers/ajv';
import { type JSONSchemaType } from 'ajv';
import { fullFormats } from 'ajv-formats/dist/formats';
import { FormProvider, useForm } from 'react-hook-form';

import { FormFields, FormGroup, SubmitButton } from '@/components/form';

type CoreFormData = {
  title: string;
};

const coreFormFields: FormFields<CoreFormData> = {
  title: {
    kind: 'text',
    label: 'Title',
    variant: 'short'
  }
};

const coreFormSchema: JSONSchemaType<CoreFormData> = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1
    }
  },
  additionalProperties: false,
  required: ['title']
};

export const FormInstrumentBuilder = () => {
  const methods = useForm<CoreFormData>({
    resolver: ajvResolver<CoreFormData>(coreFormSchema, {
      formats: fullFormats
    })
  });

  const handleFormSubmission = (data: CoreFormData) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
    methods.reset();
  };

  return (
    <FormProvider {...methods}>
      <form autoComplete="off" className="w-full" onSubmit={methods.handleSubmit(handleFormSubmission)}>
        <FormGroup fields={coreFormFields} title="Metadata" />
        <SubmitButton label="Submit" />
      </form>
    </FormProvider>
  );
};
