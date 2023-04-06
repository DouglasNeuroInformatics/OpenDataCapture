import React, { useMemo, useState } from 'react';

import { FormFields, FormInstrument, FormInstrumentContent, FormInstrumentData } from '@ddcp/common';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button } from '../Button';

import { ArrayField } from './ArrayField';
import { PrimitiveFormField } from './PrimitiveFormField';
import { FormErrors, FormValues, NullableArrayFieldValue } from './types';

import { FormProvider } from '@/context/FormContext';
import { ajv } from '@/services/ajv';

const DEFAULT_PRIMITIVE_VALUES = {
  text: '',
  options: '',
  date: '',
  numeric: null,
  binary: null
};

/** Returns the default values when initializing the state or resetting the form */
const getDefaultValues = <T extends FormInstrumentData>(content: FormInstrumentContent<T>): FormValues<T> => {
  const defaultValues: Partial<FormValues<T>> = {};
  const fields = (Array.isArray(content) ? content.map((group) => group.fields) : content) as FormFields<T>;
  for (const fieldName in fields) {
    const field = fields[fieldName];
    if (field.kind === 'array') {
      const defaultItemValues: NullableArrayFieldValue[number] = {};
      for (const subfieldName in field.fieldset) {
        const subfield = field.fieldset[subfieldName];
        defaultItemValues[subfieldName] = DEFAULT_PRIMITIVE_VALUES[subfield.kind];
      }
      defaultValues[fieldName] = [defaultItemValues];
    } else {
      defaultValues[fieldName] = DEFAULT_PRIMITIVE_VALUES[field.kind];
    }
  }
  return defaultValues as FormValues<T>;
};

export interface FormProps<T extends FormInstrumentData>
  extends Pick<FormInstrument<T>, 'content' | 'validationSchema'> {
  className?: string;
  initialValues?: FormValues<T> | null;
  submitBtnLabel?: string;
  onSubmit: (data: T) => void;
}

export const Form = <T extends FormInstrumentData>({
  content,
  className,
  initialValues,
  submitBtnLabel,
  validationSchema,
  onSubmit
}: FormProps<T>) => {
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [values, setValues] = useState<FormValues<T>>(() => initialValues ?? getDefaultValues(content));

  const { t } = useTranslation('form');

  const reset = () => {
    setValues(getDefaultValues(content));
    setErrors({});
  };
  const validate = useMemo(() => ajv.compile(validationSchema), [validationSchema]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const valid = validate(values);
    if (valid) {
      reset();
      onSubmit(values as T);
    } else {
      validate.errors?.forEach((error) => {
        const path = error.instancePath.split('/').filter((e) => e);
        const errorMessage = `${error.message ?? 'Unknown Error'}`;
        setErrors((prevErrors) => {
          return { ...prevErrors, [path[0]]: errorMessage };
        });
      });
    }
  };

  const renderFormField = (fields: FormFields<T>) => {
    return Object.keys(fields).map((fieldName) => {
      const props = { name: fieldName, ...fields[fieldName] };
      if (props.kind === 'array') {
        return <ArrayField key={props.name} {...props} />;
      }
      return <PrimitiveFormField key={props.name} {...props} />;
    });
  };

  return (
    <FormProvider {...{ errors, setErrors, values, setValues }}>
      <form autoComplete="off" className={clsx('w-full', className)} onSubmit={handleSubmit}>
        {Array.isArray(content)
          ? content.map((fieldGroup, i) => {
              return (
                <div className="font-semibold" key={i}>
                  <h3>{fieldGroup.title}</h3>
                  {renderFormField(fieldGroup.fields as FormFields<T>)}
                </div>
              );
            })
          : renderFormField(content)}
        <div className="w-full">
          <Button className="w-full" label={submitBtnLabel ?? t('submit')} type="submit" />
        </div>
      </form>
    </FormProvider>
  );
};
