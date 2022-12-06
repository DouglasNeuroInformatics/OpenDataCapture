import * as yup from 'yup';

import { baseSchema } from './base';

export type Sex = 'male' | 'female';

export const baseSubjectSchema = yup.object({
  ...baseSchema.fields,
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  dateOfBirth: yup.date().required()
});

export type BaseSubjectSchema = yup.InferType<typeof baseSubjectSchema>;

export const subjectSchema = yup.object({
  ...baseSubjectSchema.fields,
  sex: yup.mixed<Sex>().oneOf(['male', 'female']).defined()
});

export type SubjectSchema = yup.InferType<typeof subjectSchema>;

export const subjectArraySchema = yup.array().of(subjectSchema).defined();

export type SubjectArraySchema = yup.InferType<typeof subjectArraySchema>;

const subject = {
  firstName: "Joshua",
  lastName: "Unrau",
  dateOfBirth: new Date(),
  sex: 'male'
}

subjectSchema.validate(subject)