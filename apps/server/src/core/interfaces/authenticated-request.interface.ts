import { AppAbility } from '@douglasneuroinformatics/common';
import { Request } from 'express';

import { UserEntity } from '@/users/entities/user.entity.js';

export interface AuthenticatedRequest extends Request {
  ability: AppAbility;
  user: UserEntity;
}
