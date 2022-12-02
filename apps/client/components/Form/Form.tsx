import React from 'react';

import { Formik, Form as FormikForm, type FormikHelpers, type FormikValues } from 'formik';
import { Validation } from 'utils';

import DateField from './DateField';
import RangeField from './RangeField';
import SelectField from './SelectField';
import SubmitButton from './SubmitButton';
import TextField from './TextField';
import { FormField, FormProps, FormSubmitHandler } from './types';

function checkFieldNamesUnique(fields: FormField[]) {
  // TBD: Check which field name is not unique
  if (!Validation.allUniqueValuesForKey(fields, 'name')) {
    throw new Error('All names for form fields must be unique');
  }
}

function getInitialValues(fields: FormField[]) {
  return Object.fromEntries(
    fields.map((field) => {
      switch (field.variant) {
        case 'date':
          return [field.name, undefined];
        case 'select':
          return [field.name, ''];
        case 'text':
          return [field.name, ''];
        case 'range':
          return [field.name, ''];
      }
    })
  );
}

const Form = ({ fields, onSubmit }: FormProps) => {
  const handleSubmit = (values: FormikValues, { resetForm, setSubmitting }: FormikHelpers<FormikValues>) => {
    onSubmit(values)
      .then(() => {
        resetForm();
        setSubmitting(false);
      })
      .catch((error) => console.error(error));
  };

  checkFieldNamesUnique(fields);
  return (
    <Formik initialValues={getInitialValues(fields)} onSubmit={handleSubmit}>
      <FormikForm autoComplete='off'>
        {fields.map((field) => {
          switch (field.variant) {
            case 'date':
              return <DateField key={field.name} {...field} />;
            case 'range':
              return <RangeField key={field.name} {...field} />;
            case 'select':
              return <SelectField key={field.name} {...field} />;
            case 'text':
              return <TextField key={field.name} {...field} />;
          }
        })}
        <SubmitButton />
      </FormikForm>
    </Formik>
  );
};

export { Form as default, type FormSubmitHandler };
