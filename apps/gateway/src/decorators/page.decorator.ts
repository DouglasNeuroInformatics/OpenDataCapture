import { Header, SetMetadata, applyDecorators } from '@nestjs/common';

export function Page() {
  return applyDecorators(Header('Content-Type', 'text/html'), SetMetadata('IS_PAGE', true));
}
