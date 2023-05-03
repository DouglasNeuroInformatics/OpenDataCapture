import { JSONSchemaType } from 'ajv';

import { LoginRequest } from '../interfaces/login-request.interface';

export const loginRequestSchema: JSONSchemaType<LoginRequest> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      minLength: 1
    },
    fingerprint: {
      type: 'object',
      nullable: true,
      required: []
    }
  },
  additionalProperties: false,
  required: ['username', 'password']
};
