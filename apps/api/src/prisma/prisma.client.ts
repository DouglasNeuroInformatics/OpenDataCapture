import { type EvaluateInstrumentOptions, evaluateInstrument } from '@open-data-capture/common/instrument';
import { InstrumentKind, Prisma, PrismaClient } from '@open-data-capture/database/core';

export const EXTENDED_PRISMA_CLIENT_TOKEN = 'PRISMA_APP_CLIENT';

export function createExtendedPrismaClient() {
  return new PrismaClient().$extends({
    model: {
      $allModels: {
        get __model__() {
          const context = Prisma.getExtensionContext(this);
          return context.$name;
        },
        async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
          const context = Prisma.getExtensionContext(this) as unknown as {
            findFirst: (...args: any[]) => Promise<unknown>;
          };
          const result = await context.findFirst({ where });
          return result !== null;
        }
      }
    },
    result: {
      instrumentModel: {
        toInstance: {
          compute({ bundle }) {
            return function <TKind extends InstrumentKind>(options?: EvaluateInstrumentOptions<TKind>) {
              return evaluateInstrument(bundle, options);
            };
          },
          needs: { bundle: true }
        }
      }
    }
  });
}

export type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;
