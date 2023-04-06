import { JSONSchemaType } from 'ajv';

import { SubjectIdentificationData } from '../interfaces/subject-identification-data.interface';

export const subjectIdentificationDataSchema: JSONSchemaType<SubjectIdentificationData> = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      minLength: 1
    },
    lastName: {
      type: 'string',
      minLength: 1
    },
    dateOfBirth: {
      type: 'string',
      format: 'date'
    },
    sex: {
      type: 'string',
      enum: ['male', 'female']
    }
  },
  required: ['firstName', 'lastName', 'dateOfBirth', 'sex']
};
