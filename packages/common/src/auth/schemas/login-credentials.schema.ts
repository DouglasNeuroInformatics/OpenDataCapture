import { JSONSchemaType } from 'ajv';

import { LoginCredentials } from '../interfaces/login-credentials.interface';

export const loginCredentialsSchema: JSONSchemaType<LoginCredentials> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      minLength: 1
    }
  },
  additionalProperties: false,
  required: ['username', 'password']
};
