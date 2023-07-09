import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

/** Extracts an object of type `AppAbility` from the request */
export const UserAbility = createParamDecorator((_: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<Request>().ability;
});
