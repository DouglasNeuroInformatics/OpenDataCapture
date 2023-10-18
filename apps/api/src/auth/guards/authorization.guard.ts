import { Injectable, Logger } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable } from 'rxjs';

import { AbilityFactory } from '@/ability/ability.factory';
import type { RouteAccessType } from '@/core/decorators/route-access.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): Observable<boolean> | Promise<boolean> | boolean {
    const request = context.switchToHttp().getRequest<Request>();
    this.logger.verbose(`Request URL: ${request.url}`);

    const routeAccess = this.reflector.getAllAndOverride<RouteAccessType | undefined>('RouteAccess', [
      context.getHandler(),
      context.getClass()
    ]);

    if (routeAccess === 'public') {
      return true;
    } else if (!(routeAccess && request.user)) {
      return false;
    }

    const ability = this.abilityFactory.createForUser(request.user);
    return ability.can(routeAccess.action, routeAccess.subject);
  }
}
