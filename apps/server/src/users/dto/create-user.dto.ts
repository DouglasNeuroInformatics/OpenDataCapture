import { UserInterface, UserRole } from '../interfaces/user.interface';

import { ValidationSchema } from '@/core/validation-schema.decorator';

type CreateUserData = Omit<UserInterface, 'refreshToken'>;

@ValidationSchema<CreateUserData>({
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
    role: {
      type: 'string',
      enum: ['system-admin', 'group-admin', 'standard-user']
    }
  },
  required: ['username', 'password', 'role']
})
export class CreateUserDto implements CreateUserData {
  username: string;
  password: string;
  role: UserRole;
}
