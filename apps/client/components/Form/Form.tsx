import React, { useState } from 'react';

import { Formik, Form as FormikForm, type FormikHelpers, type FormikValues } from 'formik';
import { Validation } from 'utils';

import Alert, { AlertProps } from '../Alert';

import DateField from './DateField';
import RangeField from './RangeField';
import SelectField from './SelectField';
import SubmitButton from './SubmitButton';
import TextField from './TextField';
import { FormField, FormProps } from './types';

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
  const [alertProps, setAlertProps] = useState<Partial<AlertProps>>({
    title: '',
    message: ''
  });

  const handleCloseAlert = () => {
    setAlertProps({ title: '', message: '' });
  };

  const handleSubmit = (values: FormikValues, { resetForm, setSubmitting }: FormikHelpers<FormikValues>) => {
    onSubmit(values)
      .then(() => {
        setAlertProps({
          title: 'Success',
          message: 'Successfully submitted form data to server.'
        });
      })
      .catch((error) => {
        if (error instanceof Error) {
          setAlertProps({
            title: 'Failed to Submit Form',
            message: `
              During submission of this form, an exception was raised. This could be due to several 
              reasons. If you are unable to resolve the issue on your own, please provide the following 
              technical information to your administrator.
            `,
            error: error
          });
        } else {
          // I would never throw anything else, but someone else might down the road who knows
          alert('An unexpected issue occurred. Please check the browser console for more information.');
          console.error(`During the execution of callback function "onSubmit", a non-error value was throw!`);
        }
      })
      .finally(() => {
        resetForm();
        setSubmitting(false);
      });
  };

  checkFieldNamesUnique(fields);
  return (
    <React.Fragment>
      <Alert {...alertProps} handleClose={handleCloseAlert} />
      <Formik initialValues={getInitialValues(fields)} onSubmit={handleSubmit}>
        <FormikForm autoComplete="off">
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
    </React.Fragment>
  );
};

export default Form;
