import React from 'react';

import { Formik, Field, Form as FormikForm, FormikHelpers } from 'formik';
import Patient, { patientSchema } from '~/models/Patient';
import TextField from './TextField';

type FormValues = Partial<Patient>;

type FormSubmitHandler = (values: FormValues, helpers: FormikHelpers<FormValues>) => void

const formValues: FormValues = {
  firstName: '',
  lastName: '',
  sex: 'male',
  dateOfBirth: new Date()
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
        <button type="submit">Submit</button>
      </FormikForm>
    </Formik>
  );
};

export default Form;