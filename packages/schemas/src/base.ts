import * as yup from 'yup';

export const baseSchema = yup.object({
  _id: yup.string().optional(),
  createdAt: yup.date().optional(),
  updatedAt: yup.date().optional()
});

export type BaseSchema = yup.InferType<typeof baseSchema>;
