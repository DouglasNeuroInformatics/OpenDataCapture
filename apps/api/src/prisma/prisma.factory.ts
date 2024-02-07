import { InternalServerErrorException, Logger } from '@nestjs/common';
import { InstrumentKind, Prisma, PrismaClient } from '@open-data-capture/database/core';
import { InstrumentInterpreter, type InterpretOptions } from '@open-data-capture/instrument-interpreter';
import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';

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
          async exists<T extends object>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
            const name = Reflect.get(this, '$name') as string;
            PrismaFactory.logger.debug(`Checking if instance of '${name}' exists...`);
            let result: boolean;
            try {
              const context = Prisma.getExtensionContext(this) as unknown as {
                findFirst: (...args: any[]) => Promise<unknown>;
              };
              result = (await context.findFirst({ where })) !== null;
            } catch (err) {
              PrismaFactory.logger.fatal(err);
              throw new InternalServerErrorException('Prisma Error', { cause: err });
            }
            PrismaFactory.logger.debug(`Done checking if instance of '${name}' exists: result = ${result}`);
            return result;
          }
        }
      },
      result: {
        instrumentModel: {
          toInstance: {
            compute({ bundle }) {
              return async function <TKind extends InstrumentKind>(options?: InterpretOptions<TKind>) {
                const interpreter = new InstrumentInterpreter();
                const transformer = new InstrumentTransformer();
                bundle = await transformer.transformRuntimeImports(bundle);
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
