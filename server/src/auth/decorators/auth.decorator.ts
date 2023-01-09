import { SetMetadata, applyDecorators } from '@nestjs/common';

interface AuthOptions {
  isPublic?: boolean
}

export const enum AuthKeys {
  isPublic
}

export const Auth = (options: AuthOptions): any => {
  return applyDecorators(SetMetadata(AuthKeys.isPublic, options.isPublic));
};
