import * as yup from 'yup';

type Sex = 'male' | 'female';

const subjectSchema = yup.object({
  _id: yup.string().notRequired(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  sex: yup.mixed<Sex>().oneOf(['male', 'female']).defined(),
  dateOfBirth: yup.date().required(),
});

type SubjectType = yup.InferType<typeof subjectSchema>;

export { subjectSchema, type SubjectType, type Sex };