import { JSONSchemaType } from 'ajv';

import { Group } from '../interfaces/group.interface';

export const groupSchema: JSONSchemaType<Group> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    }
  },
  additionalProperties: false,
  required: ['name']
};
