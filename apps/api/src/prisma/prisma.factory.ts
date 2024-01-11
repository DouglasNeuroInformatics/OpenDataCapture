import { ConfigService } from '@nestjs/config';
import { type EvaluateInstrumentOptions, evaluateInstrument } from '@open-data-capture/common/instrument';
import { InstrumentKind, Prisma, PrismaClient } from '@open-data-capture/database/core';

export const PRISMA_CLIENT_TOKEN = 'PRISMA_CLIENT';

export class PrismaFactory {
  static createClient(this: void, configService: ConfigService) {
    const mongoUri = configService.getOrThrow<string>('MONGO_URI');
    const dbName = configService.getOrThrow<string>('NODE_ENV');
    return new PrismaClient({ datasourceUrl: `${mongoUri}/data-capture-${dbName}` }).$extends({
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
}

export type ExtendedPrismaClient = ReturnType<typeof PrismaFactory.createClient>;
