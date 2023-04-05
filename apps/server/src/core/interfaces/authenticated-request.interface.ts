import { AppAbility } from '@ddcp/common';
import { Request } from 'express';

import { UserEntity } from '@/users/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  ability: AppAbility;
  user: UserEntity;
}
