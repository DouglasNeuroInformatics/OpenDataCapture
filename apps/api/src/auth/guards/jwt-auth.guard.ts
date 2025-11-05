import { PureAbility } from '@casl/ability';
import { LoggingService } from '@douglasneuroinformatics/libnest';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { ROUTE_ACCESS_METADATA_KEY } from '@/core/decorators/route-access.decorator.js';
import type { RouteAccessType } from '@/core/decorators/route-access.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly reflector: Reflector
  ) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    this.loggingService.verbose(`Checking auth for request url: ${request.url}`);

    const routeAccess = this.reflector.get<RouteAccessType | undefined>(
      ROUTE_ACCESS_METADATA_KEY,
      context.getHandler()
    );

    if (!routeAccess) {
      this.loggingService.error(`Route access is not defined for url: ${request.url}`);
      throw new InternalServerErrorException();
    }

    if (routeAccess === 'public') {
      this.loggingService.verbose(`Granting access for public route: ${request.url}`);
      return true;
    }

    const isAuthenticated = await super.canActivate(context);
    if (isAuthenticated !== true) {
      return false;
    }

    const ability = request.user?.ability;

    if (!(ability instanceof PureAbility)) {
      this.loggingService.error('User property of request does not include expected AppAbility');
      throw new InternalServerErrorException();
    }

    return Array.isArray(routeAccess)
      ? routeAccess.every(({ action, subject }) => ability.can(action, subject))
      : ability.can(routeAccess.action, routeAccess.subject);
  }
}
