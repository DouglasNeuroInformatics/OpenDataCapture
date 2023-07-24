import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

import { UserEntity } from '@/users/entities/user.entity.js';

export const CurrentUser = createParamDecorator((key: keyof UserEntity | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  if (key) {
    return request.user?.[key];
  }
  return request.user;
});
