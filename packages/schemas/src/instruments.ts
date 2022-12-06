import * as yup from 'yup';

import { baseSchema } from './base';

export const happinessQuestionnaireSchema = yup.object({
  ...baseSchema.fields,
  score: yup.number().integer().min(0).max(10).required()
})

export type HappinessQuestionnaireSchema = yup.InferType<typeof happinessQuestionnaireSchema>;

export const happinessQuestionnaireArraySchema = yup.array().of(happinessQuestionnaireSchema).defined();

export type HappinessQuestionnaireArraySchema = yup.InferType<typeof happinessQuestionnaireArraySchema>;
