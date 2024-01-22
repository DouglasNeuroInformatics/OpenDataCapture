import { Logger } from '@nestjs/common';
import { InstrumentKind, Prisma, PrismaClient } from '@open-data-capture/database/core';
import { InstrumentInterpreter, type InstrumentInterpreterOptions } from '@open-data-capture/instrument-interpreter';

export const PRISMA_CLIENT_TOKEN = 'PRISMA_CLIENT';

export class PrismaFactory {
  private static logger = new Logger(PrismaFactory.name);

  static createClient(options: Prisma.PrismaClientOptions) {
    this.logger.debug(`Attempting to create PrismaClient...`);
    const baseClient = new PrismaClient(options);
    this.logger.debug('Finished creating PrismaClient');

    this.logger.debug('Attempting to apply client extensions...');
    const extendedClient = baseClient.$extends({
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
              return function <TKind extends InstrumentKind>(options?: InstrumentInterpreterOptions<TKind>) {
                const interpreter = new InstrumentInterpreter();
                return interpreter.interpret(bundle, options);
              };
            },
            needs: { bundle: true }
          }
        }
      }
    });
    this.logger.debug('Finished applying client extensions');
    return extendedClient;
  }
}

export type ExtendedPrismaClient = ReturnType<typeof PrismaFactory.createClient>;
