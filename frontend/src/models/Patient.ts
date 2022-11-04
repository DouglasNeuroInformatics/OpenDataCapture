import yup from 'yup';

const patientSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  sex: yup.mixed().oneOf(['male', 'female', 'other']).defined(),
  dateOfBirth: yup.date().required(),
});


type Patient = yup.InferType<typeof patientSchema>;

export { Patient as default, patientSchema };