import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export const UserAbility = createParamDecorator((_: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<AuthenticatedRequest>().ability;
});
