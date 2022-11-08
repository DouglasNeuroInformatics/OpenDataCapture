import React from 'react';

import { Field, Form as FormikForm, Formik, FormikHelpers } from 'formik';

import DateField from './DateField';
import SelectField from './SelectField';
import SubmitButton from './SubmitButton';
import TextField from './TextField';

import postPatient from '@/api/postPatient';
import Patient, { patientSchema } from '@/models/Patient';

type FormValues = Partial<Patient>;

type FormSubmitHandler = (values: FormValues, helpers: FormikHelpers<FormValues>) => void;

const formValues: FormValues = {
  firstName: '',
  lastName: '',
  sex: undefined,
  dateOfBirth: undefined,
};

const sexOptions = {
  Male: 'male',
  Female: 'female',
};

const Form = () => {
  const handleSubmit: FormSubmitHandler = (values, { resetForm, setSubmitting }) => {
    postPatient(values as Patient) // check properly
      .then(() => alert('Success!'));
    resetForm();
    setSubmitting(false);
  };

  return (
    <React.Fragment>
      <Formik initialValues={formValues} validationSchema={patientSchema} onSubmit={handleSubmit}>
        <FormikForm autoComplete="off">
          <Field label="First Name" name="firstName" component={TextField} />
          <Field label="Last Name" name="lastName" component={TextField} />
          <Field as="select" label="Sex" name="sex" options={sexOptions} component={SelectField} />
          <DateField name="dateOfBirth" label="Date of Birth" />
          <SubmitButton />
        </FormikForm>
      </Formik>
    </React.Fragment>
  );
};

export default Form;
