import { SetMetadata } from '@nestjs/common';
import type { AppAction, AppSubjectName } from '@open-data-capture/common/core';

type PublicRouteAccess = 'public';

export type ProtectedRoutePermissionSet = {
  action: AppAction;
  subject: AppSubjectName;
};

export type ProtectedRouteAccess = ProtectedRoutePermissionSet | ProtectedRoutePermissionSet[];

export type RouteAccessType = ProtectedRouteAccess | PublicRouteAccess;

export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata('RouteAccess', value);
}
