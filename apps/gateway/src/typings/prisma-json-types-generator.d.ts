import type { ActiveLanguages as SchemaActiveLanguages } from '@opendatacapture/schemas/core';

declare global {
  namespace PrismaJson {
    type ActiveLanguages = SchemaActiveLanguages;
  }
}
