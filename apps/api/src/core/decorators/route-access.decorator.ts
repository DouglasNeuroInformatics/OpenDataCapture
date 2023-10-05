import { SetMetadata } from '@nestjs/common';
import type { AppAction, AppSubject } from '@open-data-capture/types';

type PublicRouteAccess = 'public';

export type ProtectedRouteAccess = {
  action: AppAction;
  subject: AppSubject;
};

export type RouteAccessType = ProtectedRouteAccess | PublicRouteAccess;

export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata('RouteAccess', value);
}
