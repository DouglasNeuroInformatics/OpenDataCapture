import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';
import { Observable } from 'rxjs';

import { AbilityFactory } from '@/ability/ability.factory';
import { RouteAccessType } from '@/core/decorators/route-access.decorator';
import { UserEntity } from '@/users/entities/user.entity';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(private readonly reflector: Reflector, private readonly abilityFactory: AbilityFactory) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    this.logger.verbose(`Request URL: ${request.url}`);

    const routeAccess = this.reflector.getAllAndOverride<RouteAccessType | undefined>('RouteAccess', [
      context.getHandler(),
      context.getClass()
    ]);

    if (routeAccess === 'public') {
      return true;
    } else if (!routeAccess) {
      return false;
    }

    const ability = this.abilityFactory.createForUser(request.user as UserEntity);
    return ability.can(routeAccess.action, routeAccess.subject);
  }
}
