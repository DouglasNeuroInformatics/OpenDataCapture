import React from 'react';

import { FormInstrument, FormInstrumentData } from '@ddcp/common';
import { clsx } from 'clsx';

import { Button } from '../Button';

import { DateField } from './DateField';
import { NumericField } from './NumericField';
import { OptionsField } from './OptionsField';
import { TextField } from './TextField';
import { FormValues } from './types';

import { FormProvider } from '@/context/FormContext';
import { useForm } from '@/hooks/useForm';

export interface FormProps<T extends FormInstrumentData>
  extends Pick<FormInstrument<T>, 'content' | 'validationSchema'> {
  className?: string;
  submitBtnLabel?: string;
  onSubmit: (data: FormValues<T>) => void;
}

export const Form = <T extends FormInstrumentData>({
  content,
  className,
  // validationSchema,
  submitBtnLabel,
  onSubmit
}: FormProps<T>) => {
  const form = useForm<T>(content);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    form.reset();
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
            case 'numeric':
              return <NumericField {...props} />;
            case 'options':
              return <OptionsField {...props} />;
            case 'date':
              return <DateField {...props} />;
            default:
              return null;
          }
        })}
        <Button className="mt-5 w-full" label={submitBtnLabel ?? 'Submit'} type="submit" />
      </form>
    </FormProvider>
  );
};
