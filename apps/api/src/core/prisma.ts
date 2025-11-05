import { LibnestPrismaExtension } from '@douglasneuroinformatics/libnest';
import type {
  ConfigService,
  PrismaModelKey,
  PrismaModelName,
  PrismaModuleOptions
} from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { MongoMemoryReplSet } from 'mongodb-memory-server';

@Injectable()
export class PrismaModuleOptionsFactory implements OnApplicationShutdown {
  private memoryReplSet: MongoMemoryReplSet | null;

  constructor(private readonly configService: ConfigService) {
    this.memoryReplSet = null;
  }

  async create() {
    let datasourceUrl: string;
    if (this.configService.get('NODE_ENV') === 'test') {
      datasourceUrl = await this.createMemoryConnection();
    } else {
      datasourceUrl = this.getExternalConnection();
    }
    const client = new PrismaClient({
      datasourceUrl,
      omit: {
        user: {
          hashedPassword: true
        }
      }
    }).$extends(LibnestPrismaExtension);
    await client.$connect();
    return { client } satisfies PrismaModuleOptions;
  }

  async onApplicationShutdown() {
    if (this.memoryReplSet) {
      await this.memoryReplSet.stop();
    }
  }

  private async createMemoryConnection(): Promise<string> {
    // prevent mongodb-memory-server from being included in the production bundle
    const { MongoMemoryReplSet } = await import('mongodb-memory-server');
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, name: 'rs0' } });
    return new URL(replSet.getUri('test')).href;
  }

  private getExternalConnection(): string {
    const mongoUri = this.configService.get('MONGO_URI');
    const env = this.configService.get('NODE_ENV');
    const url = new URL(`${mongoUri.href}/data-capture-${env}`);
    const params = {
      directConnection: this.configService.get('MONGO_DIRECT_CONNECTION'),
      replicaSet: this.configService.get('MONGO_REPLICA_SET'),
      retryWrites: this.configService.get('MONGO_RETRY_WRITES'),
      w: this.configService.get('MONGO_WRITE_CONCERN')
    };
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.append(key, String(value));
      }
    }
    return url.href;
  }
}

export type RuntimePrismaClient = Awaited<
  ReturnType<(typeof PrismaModuleOptionsFactory)['prototype']['create']>
>['client'];

export type PrismaModelWhereInputMap = {
  [K in PrismaModelName]: PrismaClient[PrismaModelKey<K>] extends {
    findFirst: (args: { where: infer TWhereInput }) => any;
  }
    ? TWhereInput
    : never;
};
