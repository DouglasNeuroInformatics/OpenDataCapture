import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';

import { UserEntity } from '@/users/entities/user.entity.js';

export const CurrentUser = createParamDecorator((key: keyof UserEntity | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (key) {
    return request.user[key];
  }
  return request.user;
});
