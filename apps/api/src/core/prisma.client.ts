import { LibnestPrismaExtension } from '@douglasneuroinformatics/libnest';
import type { PrismaModelKey, PrismaModelName } from '@douglasneuroinformatics/libnest';
import { PrismaClient } from '@prisma/client';

export function createPrismaClient(datasourceUrl: string) {
  return new PrismaClient({ datasourceUrl }).$extends(LibnestPrismaExtension);
}

export type RuntimePrismaClient = ReturnType<typeof createPrismaClient>;

export type PrismaModelWhereInputMap = {
  [K in PrismaModelName]: PrismaClient[PrismaModelKey<K>] extends {
    findFirst: (args: { where: infer TWhereInput }) => any;
  }
    ? TWhereInput
    : never;
};
