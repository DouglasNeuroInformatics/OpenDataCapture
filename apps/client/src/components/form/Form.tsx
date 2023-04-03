import React, { useMemo } from 'react';

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
import { ajv } from '@/services/ajv';

export interface FormProps<T extends FormInstrumentData>
  extends Pick<FormInstrument<T>, 'content' | 'validationSchema'> {
  className?: string;
  submitBtnLabel?: string;
  onSubmit: (data: FormValues<T>) => void;
}

export const Form = <T extends FormInstrumentData>({
  content,
  className,
  submitBtnLabel,
  validationSchema,
  onSubmit
}: FormProps<T>) => {
  const form = useForm<T>(content);
  const validate = useMemo(() => ajv.compile(validationSchema), [validationSchema]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const valid = validate(form.values);
    if (valid) {
      form.reset();
      onSubmit(form.values);
    } else {
      validate.errors?.forEach((error) => {
        const path = error.instancePath.split('/').filter((e) => e);
        const errorMessage = `${error.keyword}: ${error.message ?? 'Unknown'}`;
        form.setErrors((prevErrors) => {
          return { ...prevErrors, [path[0]]: errorMessage };
        });
      });
    }
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
              return <TextField key={props.name} {...props} />;
            case 'numeric':
              return <NumericField key={props.name} {...props} />;
            case 'options':
              return <OptionsField key={props.name} {...props} />;
            case 'date':
              return <DateField key={props.name} {...props} />;
            default:
              return null;
          }
        })}
        <Button className="mt-5 w-full" label={submitBtnLabel ?? 'Submit'} type="submit" />
      </form>
    </FormProvider>
  );
};
