import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import { type AppAbility, type User } from '@open-data-capture/types';
import { type Request } from 'express';

export type AppUser = User & {
  ability: AppAbility;
};

export const CurrentUser = createParamDecorator((key: keyof AppUser | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  if (key) {
    return request.user?.[key];
  }
  return request.user;
});
