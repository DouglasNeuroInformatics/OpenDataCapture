import { UserKind } from '../enums/user-kind.enum';

import { Dto } from '@/core/dto.decorator';

interface CreateUserData {
  kind: UserKind;
  username: string;
  password: string;
}

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
export const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

@Dto<CreateUserData>({
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      default: UserKind.Standard,
      enum: [UserKind.Admin, UserKind.Standard]
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
  kind: UserKind;
  username: string;
  password: string;
}
