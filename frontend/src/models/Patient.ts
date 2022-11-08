import * as yup from 'yup';

type Sex = 'male' | 'female';

const patientSchema = yup.object({
  _id: yup.string().notRequired(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  sex: yup.mixed<Sex>().oneOf(['male', 'female']).defined(),
  dateOfBirth: yup.date().required(),
});

type Patient = yup.InferType<typeof patientSchema>;

export { Patient as default, patientSchema };
