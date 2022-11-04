import React from 'react';

import { Formik, Field, Form as FormikForm, FormikHelpers } from 'formik';
import Patient, { patientSchema } from '~/models/Patient';

import SelectField from './SelectField';
import TextField from './TextField';
import SubmitButton from './SubmitButton';
import DateField from './DateField';

type FormValues = Partial<Patient>;

type FormSubmitHandler = (values: FormValues, helpers: FormikHelpers<FormValues>) => void

const formValues: FormValues = {
  firstName: '',
  lastName: '',
  sex: undefined,
  dateOfBirth: new Date()
};

const sexOptions = {
  'Male': 'male',
  'Female': 'female'
};

const Form = () => {

  const handleSubmit: FormSubmitHandler = (values, { resetForm, setSubmitting }) => {
    setTimeout(() => {
      alert(JSON.stringify(values, null, 2));
      resetForm();
      setSubmitting(false);
    }, 400);
  };

  return (
    <Formik initialValues={formValues} validationSchema={patientSchema} onSubmit={handleSubmit}>
      <FormikForm>
        <Field label='First Name' name='firstName' component={TextField} />
        <Field label='Last Name' name='lastName' component={TextField} />
        <Field as='select' label='Sex' name='sex' options={sexOptions} component={SelectField} />
        <Field label='Date of Birth' name='dateOfBirth' component={DateField} />
        <SubmitButton />
      </FormikForm>
    </Formik>
  );
};

export default Form;