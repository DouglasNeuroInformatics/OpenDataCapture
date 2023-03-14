import { UserRole } from '../enums/user-role.enum';

import { Dto } from '@/core/dto.decorator';

interface CreateUserData {
  username: string;
  password: string;
  role?: UserRole;
  groups?: string[];
}

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
export const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

@Dto<CreateUserData>({
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      pattern: isStrongPassword.source
    },
    role: {
      type: 'string',
      enum: Object.values(UserRole),
      nullable: true
    },
    groups: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
      nullable: true
    }
  },
  required: ['username', 'password']
})
export class CreateUserDto {
  username: string;
  password: string;
  role?: UserRole;
  groups?: string[];
}
