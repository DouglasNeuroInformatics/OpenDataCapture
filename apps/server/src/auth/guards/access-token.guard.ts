import { ExecutionContext, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';

import { AuthKeys } from '../decorators/auth.decorator';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(AccessTokenGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(AuthKeys.IsPublic, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    // Will throw if the JWT is invalid, otherwise will populate request.user
    await super.canActivate(context);

    const request = this.getRequest(context);
    const user = this.getUser(request);

    const jwtPayloadSchema = this.reflector.getAllAndMerge('ValidationSchema', [JwtPayloadDto]);
    this.logger.log(request.user, jwtPayloadSchema);

    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }

  /** This validation should never fail, but it is better to be safe than sorry */
  private getUser(request: Request): unknown {
    const user: unknown = request.user;
    if (!user) {
      throw new InternalServerErrorException('User must be defined');
    } else if (!(user instanceof Object)) {
      throw new InternalServerErrorException('User must be object');
    }

    if (!(request.user instanceof Object)) {
      throw new InternalServerErrorException('User must be defined');
    }
    return request.user;
  }
}
