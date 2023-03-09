import { SetMetadata, applyDecorators } from '@nestjs/common';

const enum AuthKeys {
  IsPublic,
  Permissions
}

interface PublicRouteOptions {
  access: 'public';
}

interface ProtectedRouteOptions {
  access?: 'protected';
  permissions: any[];
}

type AuthOptions = PublicRouteOptions | ProtectedRouteOptions;

const Auth = (options: AuthOptions): any => {
  if (options.access === 'public') {
    return SetMetadata(AuthKeys.IsPublic, true);
  }
  return applyDecorators(SetMetadata(AuthKeys.Permissions, options.permissions));
};

export { Auth, AuthKeys };
