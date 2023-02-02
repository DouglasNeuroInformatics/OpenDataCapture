import React from 'react';

import { Popover } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInstrumentFieldInterface } from 'common';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IoMdHelpCircle } from 'react-icons/io';
import { z } from 'zod';

import { Form } from '@/components/form';

const MyPopover = ({ text }: { text: string }) => {
  return (
    <Popover className="relative">
      <Popover.Button>
        <IoMdHelpCircle />
      </Popover.Button>
      <Popover.Panel className="absolute z-10 bg-white">
        <p>{text}</p>
      </Popover.Panel>
    </Popover>
  );
};

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
      <h3 className="mt-8 mb-5 font-semibold">{title}</h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field) => {
          const error = errors[field.name]?.message as string | undefined; // Check later
          switch (field.variant) {
            case 'text':
              return (
                <div className="flex">
                  <Form.TextField error={error} label={field.label} name={field.name} register={register} />
                  <div className="flex w-12 items-center justify-center">
                    <MyPopover text={field.description} />
                  </div>
                </div>
              );
          }
        })}
        <Form.SubmitButton label={submitLabel} />
      </Form>
    </div>
  );
};
