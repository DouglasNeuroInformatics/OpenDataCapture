import { SetMetadata } from '@nestjs/common';

import { AppAction, AppSubject } from '@ddcp/types';

type PublicRouteAccess = 'public';

export type ProtectedRouteAccess = {
  action: AppAction;
  subject: AppSubject;
}

export type RouteAccessType = PublicRouteAccess | ProtectedRouteAccess;

export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata('RouteAccess', value);
}
