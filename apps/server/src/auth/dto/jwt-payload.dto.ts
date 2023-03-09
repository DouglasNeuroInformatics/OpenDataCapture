import { ValidationSchema } from '@/core/validation-schema.decorator';
import { UserRole } from '@/users/users.types';

interface JwtPayload {
  username: string;
  role: UserRole;
}

@ValidationSchema<JwtPayload>({
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    role: {
      type: 'string',
      enum: ['standard-user', 'group-manager', 'system-admin']
    }
  },
  additionalProperties: true,
  required: ['username', 'role']
})
export class JwtPayloadDto implements JwtPayload {
  username: string;
  role: UserRole;
}
