import { JwtPayload } from '../auth.types';

import { ValidationSchema } from '@/core/validation-schema.decorator';

@ValidationSchema<JwtPayload>({
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    }
  },
  additionalProperties: true,
  required: ['username']
})
export class JwtPayloadDto implements JwtPayload {
  username: string;
}
