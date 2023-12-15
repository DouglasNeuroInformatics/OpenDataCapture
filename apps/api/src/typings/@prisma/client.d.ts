/**
 * This is necessary because `@casl/prisma` uses the generated types to
 * enforce type safety on rules. This ensures that we do not lose that
 * safety just because we have a custom setup for generated code.
 */

declare module '@prisma/client' {
  export { Prisma, PrismaClient } from '@open-data-capture/database/core';
}
