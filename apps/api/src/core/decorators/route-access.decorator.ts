import { SetMetadata } from '@nestjs/common';

import type { AppAction, AppSubjectName } from '../../auth/auth.types.js';

const ROUTE_ACCESS_METADATA_KEY = 'ODC_ROUTE_ACCESS_TOKEN';

export type PublicRouteAccess = 'public';

export type ProtectedRoutePermissionSet = {
  action: AppAction;
  subject: AppSubjectName;
};

export type ProtectedRouteAccess = ProtectedRoutePermissionSet | ProtectedRoutePermissionSet[];

export type RouteAccessType = ProtectedRouteAccess | PublicRouteAccess;

export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata(ROUTE_ACCESS_METADATA_KEY, value);
}

export { ROUTE_ACCESS_METADATA_KEY };
