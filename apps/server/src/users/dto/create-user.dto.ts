import { UserRole } from '../enums/user-role.enum';

import { Dto } from '@/core/dto.decorator';

interface CreateUserData {
  role?: UserRole;
  username: string;
  password: string;
}

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
export const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

@Dto<CreateUserData>({
  type: 'object',
  properties: {
    role: {
      type: 'string',
      enum: [UserRole.Admin, UserRole.Standard],
      nullable: true
    },
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      pattern: isStrongPassword.source
    }
  },
  required: ['username', 'password']
})
export class CreateUserDto {
  role?: UserRole;
  username: string;
  password: string;
}
