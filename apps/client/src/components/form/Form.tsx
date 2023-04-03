import React from 'react';

import { FormInstrument, FormInstrumentData } from '@ddcp/common';
import { clsx } from 'clsx';

import { TextField } from './TextField';
import { FormValues } from './types';

import { FormProvider } from '@/context/FormContext';
import { useForm } from '@/hooks/useForm';

export interface FormProps<T extends FormInstrumentData>
  extends Pick<FormInstrument<T>, 'content' | 'validationSchema'> {
  className?: string;
  onSubmit: (data: FormValues<T>) => void;
}

export const Form = <T extends FormInstrumentData>({
  content,
  className,
  // validationSchema,
  onSubmit
}: FormProps<T>) => {
  const form = useForm<T>(content);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit(form.values);
  };

  if (Array.isArray(content)) {
    return <h1>Error</h1>;
  }

  return (
    <FormProvider {...form}>
      <form autoComplete="off" className={clsx('w-full', className)} onSubmit={handleSubmit}>
        {Object.keys(content).map((fieldName) => {
          const props = { name: fieldName, ...content[fieldName] };
          switch (props.kind) {
            case 'text':
              return <TextField {...props} />;
            default:
              return null;
          }
        })}
      </form>
    </FormProvider>
  );
};
