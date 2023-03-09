import { SetMetadata } from '@nestjs/common';

import type { JSONSchemaType } from 'ajv';

export function ValidationSchema<T>(value: JSONSchemaType<T>): any {
  return SetMetadata('ValidationSchema', value);
}
