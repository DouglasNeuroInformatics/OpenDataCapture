import React, { useState } from 'react';

import {
  ArrayFieldValue,
  ArrayFormField,
  FormFields,
  FormInstrument,
  FormInstrumentData,
  PrimitiveFormField
} from '@ddcp/common';

import { FormValues, NullableArrayFieldValue } from './types';

const DEFAULT_PRIMITIVE_VALUES = {
  text: '',
  options: '',
  date: '',
  numeric: null,
  binary: null
};

export interface FormProps<T extends FormInstrumentData>
  extends Pick<FormInstrument<T>, 'content' | 'validationSchema'> {
  className?: string;
  onSubmit: (data: T) => void;
}

export const Form = <T extends FormInstrumentData>({ content, validationSchema }: FormProps<T>) => {
  const [values, setValues] = useState<FormValues<T>>(() => {
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
  });

  console.log(values);

  return null;
};

/*
import {
  ArrayFieldValue,
  ArrayFormField,
  FormField,
  FormFieldKind,
  FormFields,
  FormInstrument,
  FormInstrumentData,
  PrimitiveFieldValue,
  PrimitiveFormField
} from '@ddcp/common';

import { FormValues } from './types';

import { useForm } from '@/hooks/useForm';
import { ajv } from '@/services/ajv';



const getDefaultValues = <T extends FormInstrumentData>(fields: FormFields<T>) => {
  const defaultValues: FormValues<T> = {};
  for (const fieldName in fields) {
    const field = fields[fieldName];
    if (field.kind !== 'array') {
      defaultValues[fieldName] = null;
    }
  }

  return defaultValues as FormValues<T>;

  /*
  for (const fieldName in fields) {
    const field = fields[fieldName];
    if (field.kind === 'array') {
      defaultValues[fieldName] = [];
      // defaultValues[fieldName] = 'Array';
    } else {
      defaultValues[fieldName] = null; //DEFAULT_PRIMITIVE_VALUES[field.kind];
    }
  }
  return defaultValues;

};

export interface FormProps<T extends FormInstrumentData>
  extends Pick<FormInstrument<T>, 'content' | 'validationSchema'> {
  className?: string;
  onSubmit: (data: T) => void;
}

export const Form = <T extends FormInstrumentData>({ content, validationSchema }: FormProps<T>) => {
  const [values, setValues] = useState<FormValues<T>>(() => {
    const defaultValues: Partial<FormValues<T>> = {};

    if (Array.isArray(content)) {
      throw new Error('Not implemented');
    }

    return getDefaultValues(content);
  });

  console.log(values);

  return <form action=""></form>;

  const [values, setValues] = useState<FormValues<T>>(() => {
    let defaultValues: FormInstrumentData;
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  const handleChange = (key: keyof T, value: FieldValue) => {
    setValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  return (
    <FormContext.Provider value={{ errors, values }}>
      <form autoComplete="off" onSubmit={handleSubmit}></form>
    </FormContext.Provider>
  );
};
*/
