import React, { useMemo } from 'react';

import { FormInstrument, FormInstrumentData } from '@ddcp/common';
import { clsx } from 'clsx';

import { Button } from '../Button';

import { ArrayField } from './ArrayField';
import { PrimitiveFormField } from './PrimitiveFormField';
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
        const errorMessage = `${error.message ?? 'Unknown Error'}`;
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
          if (props.kind === 'array') {
            return <ArrayField key={props.name} {...props} />;
          }
          return <PrimitiveFormField key={props.name} {...props} />;
        })}
        <div className="w-full">
          <Button className="w-full" label={submitBtnLabel ?? 'Submit'} type="submit" />
        </div>
      </form>
    </FormProvider>
  );
};
