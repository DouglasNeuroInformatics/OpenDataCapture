import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';

import { JwtPayload, UserRole } from 'common';
import { Request } from 'express';
import Joi from 'joi';

const requestUserSchema = Joi.object<JwtPayload>({
  username: Joi.string().required(),
  role: Joi.string().valid(...Object.values(UserRole)),
  refreshToken: Joi.string()
}).required();

export const RequestUser = createParamDecorator((key: keyof JwtPayload | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  const { error, value } = requestUserSchema.validate(request.user, {
    allowUnknown: true
  });

  if (error) {
    throw new UnauthorizedException(error.message);
  }
  return key ? value[key] : value;
});
