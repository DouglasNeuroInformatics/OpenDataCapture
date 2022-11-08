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
});

type PatientIdData = yup.InferType<typeof patientIdDataSchema>;

type FormValues = Partial<PatientIdData>;


const formValues: FormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: undefined,
};


type FormSubmitHandler = (values: FormValues, helpers: FormikHelpers<FormValues>) => void;

const HappinessForm = () => {
  const handleSubmit: FormSubmitHandler = async (values, { resetForm, setSubmitting }) => {
    alert('Submit!')
    /*
    const response = await fetch('/api/patient', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    
    });
    console.log(response.ok)
    if (response.ok) {
      console.log('Okay')
      alert('Success!')
    } else {
      alert(`An Error Occurred: ${response.status} ${response.statusText}`)
    }
    */
    resetForm();
    setSubmitting(false);
  };

  return (
    <React.Fragment>
      <Formik initialValues={formValues} validationSchema={patientIdDataSchema} onSubmit={handleSubmit}>
        <FormikForm autoComplete="off">
          <FieldsGroup title='Demographics Questions'>
            <Field label="First Name" name="firstName" component={TextField} />
            <Field label="Last Name" name="lastName" component={TextField} />
            <DateField name="dateOfBirth" label="Date of Birth" />
          </FieldsGroup>
          <FieldsGroup title='Happiness Questionnaire'>
            <Field label="Happiness Score" name="happinessScore" component={RangeField} />
          </FieldsGroup>
          <SubmitButton />
        </FormikForm>
      </Formik>
    </React.Fragment>
  );
};

export default HappinessForm;
