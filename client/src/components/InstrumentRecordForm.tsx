import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { InstrumentField } from 'common';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import Form from './Form';

const instrumentRecordFormSchema = z.record(z.string(), z.any());

type InstrumentRecordFormSchema = z.infer<typeof instrumentRecordFormSchema>;

interface InstrumentRecordFormProps {
  title: string;
  fields: InstrumentField[];
  submitLabel?: string;
  onSubmit: SubmitHandler<InstrumentRecordFormSchema>;
}

const InstrumentRecordForm = ({ onSubmit, submitLabel, title, fields }: InstrumentRecordFormProps) => {
  const { register, handleSubmit, formState } = useForm<InstrumentRecordFormSchema>({
    resolver: zodResolver(instrumentRecordFormSchema)
  });

  const { errors } = formState;

  return (
    <div>
      <h3>{title}</h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field) => {
          const error = errors[field.name]?.message as string | undefined; // Check later
          switch (field.type) {
            case 'text':
              return <Form.TextField error={error} label={field.label} name={field.name} register={register} />;
          }
        })}
        <Form.SubmitButton label={submitLabel} />
      </Form>
    </div>
  );
};

export { InstrumentRecordForm as default, instrumentRecordFormSchema, type InstrumentRecordFormSchema };
