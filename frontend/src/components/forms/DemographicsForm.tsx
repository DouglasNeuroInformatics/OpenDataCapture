import React from 'react';

import { Field, Form as FormikForm, Formik, FormikHelpers } from 'formik';

import DateField from './DateField';
import SelectField from './SelectField';
import SubmitButton from './SubmitButton';
import TextField from './TextField';

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
  const handleSubmit: FormSubmitHandler = async (values, { resetForm, setSubmitting }) => {
    const response = await fetch('/api/patient', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    console.log(response.ok);
    if (response.ok) {
      console.log('Okay');
      alert('Success!');
    } else {
      alert(`An Error Occurred: ${response.status} ${response.statusText}`);
    }
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
