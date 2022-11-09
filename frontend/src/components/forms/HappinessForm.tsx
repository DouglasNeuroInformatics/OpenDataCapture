import React from 'react';

import { Field, Form as FormikForm, Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';

import DateField from './DateField';
import FieldsGroup from './FieldsGroup';
import RangeField from './RangeField';
import SubmitButton from './SubmitButton';
import TextField from './TextField';

const patientIdDataSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  dateOfBirth: yup.date().required(),
 score: yup.number().integer().min(0).max(10).required(),
});

interface FormValues {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
 score?: string
}

const formValues: FormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: undefined,
 score: '',
};

type FormSubmitHandler = (values: FormValues, helpers: FormikHelpers<FormValues>) => void;

const HappinessForm = () => {
  const handleSubmit: FormSubmitHandler = async (values, { resetForm, setSubmitting }) => {
    const response = await fetch('/api/instrument/happiness-scale', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    
    });
    if (response.ok) {
      console.log('Okay', values)
      alert('Success!')
    } else {
      alert(`An Error Occurred: ${response.status} ${response.statusText}`)
    }
    resetForm();
    setSubmitting(false);
  };

  return (
    <React.Fragment>
      <Formik
        initialValues={formValues}
        validationSchema={patientIdDataSchema}
        onSubmit={handleSubmit}
      >
        <FormikForm autoComplete="off">
          <FieldsGroup title="Demographics Questions">
            <Field label="First Name" name="firstName" component={TextField} />
            <Field label="Last Name" name="lastName" component={TextField} />
            <DateField name="dateOfBirth" label="Date of Birth" />
          </FieldsGroup>
          <FieldsGroup title="Happiness Questionnaire">
            <Field label="Happiness Score" name="score" component={RangeField} />
          </FieldsGroup>
          <SubmitButton />
        </FormikForm>
      </Formik>
    </React.Fragment>
  );
};

export default HappinessForm;
