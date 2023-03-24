import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

import { User } from '@/users/entities/user.entity';

export const CurrentUser = createParamDecorator((key: keyof User | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (key) {
    return request.user[key];
  }
  return request.user;
});
