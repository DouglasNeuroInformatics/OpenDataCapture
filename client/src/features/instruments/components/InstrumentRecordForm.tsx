import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormInstrumentFieldInterface } from 'common';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/form';

export const instrumentRecordFormSchema = z.record(z.string(), z.any());

export type InstrumentRecordFormData = z.infer<typeof instrumentRecordFormSchema>;

export interface InstrumentRecordFormProps {
  title: string;
  fields: FormInstrumentFieldInterface[];
  submitLabel?: string;
  onSubmit: SubmitHandler<InstrumentRecordFormData>;
}

export const InstrumentRecordForm = ({ onSubmit, submitLabel, title, fields }: InstrumentRecordFormProps) => {
  const { register, handleSubmit, formState } = useForm<InstrumentRecordFormData>({
    resolver: zodResolver(instrumentRecordFormSchema)
  });

  const { errors } = formState;

  return (
    <div>
      <h3>{title}</h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field) => {
          const error = errors[field.name]?.message as string | undefined; // Check later
          switch (field.variant) {
            case 'text':
              return <Form.TextField error={error} label={field.label} name={field.name} register={register} />;
          }
        })}
        <Form.SubmitButton label={submitLabel} />
      </Form>
    </div>
  );
};
