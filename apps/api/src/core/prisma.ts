import { ConfigService, LibnestPrismaExtension } from '@douglasneuroinformatics/libnest';
import type { PrismaModelKey, PrismaModelName, PrismaModuleOptions } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { MongoMemoryReplSet } from 'mongodb-memory-server';
import { z } from 'zod/v4';

/** The scalar fields of a model, which are the only ones an index can be built on. */
type ModelField<TModel extends PrismaModelName> = keyof Prisma.TypeMap['model'][TModel]['payload']['scalars'] & string;

/**
 * An index the services' `where` clauses depend on. Fields are a list rather than an object because
 * their order decides which queries the index can serve, and `perfectionist/sort-objects` would
 * reorder an object literal into a different index without anything failing.
 */
type DatabaseIndex = {
  [TModel in PrismaModelName]: {
    collection: `${TModel}Model`;
    fields: [ModelField<TModel>, ...ModelField<TModel>[]];
    sparse?: boolean;
    unique?: boolean;
  };
}[PrismaModelName];

/** Only `$runCommandRaw` is needed to reconcile indexes, and asking for less keeps this off the
 * inferred return type of `PrismaModuleOptionsFactory.create`, which `RuntimePrismaClient` derives from. */
type RawCommandRunner = {
  $runCommandRaw: (command: Prisma.InputJsonObject) => Promise<unknown>;
};

const $IndexSpecification = z.object({
  // A direction is 1 or -1, but a special index (text, hashed, 2dsphere) names its kind as a string.
  key: z.record(z.string(), z.union([z.number(), z.string()])),
  name: z.string(),
  sparse: z.boolean().optional(),
  unique: z.boolean().optional()
});

const $ListIndexesResult = z.object({
  cursor: z.object({
    firstBatch: z.array($IndexSpecification)
  })
});

/** MongoDB reports a collection that does not exist yet, which is every collection before first write. */
const NAMESPACE_NOT_FOUND = 26;

/**
 * Equality fields precede range and sort fields, so a query filtering the leading fields can seek
 * rather than scan. Every entry is also declared in `prisma/schema.prisma`: `prisma db push` drops
 * any index the schema does not name.
 */
const DATABASE_INDEXES: DatabaseIndex[] = [
  { collection: 'AssignmentModel', fields: ['groupId'] },
  { collection: 'AssignmentModel', fields: ['subjectId'] },
  { collection: 'AuditLogModel', fields: ['timestamp'] },
  { collection: 'AuditLogModel', fields: ['groupId', 'timestamp'] },
  { collection: 'AuditLogModel', fields: ['userId', 'timestamp'] },
  { collection: 'GroupModel', fields: ['name'], unique: true },
  { collection: 'InstrumentRecordFileModel', fields: ['recordId'] },
  // Sparse, unlike every other unique index here. The field is optional, MongoDB indexes a missing
  // field as null, and only records completed through a remote assignment carry one — so a
  // non-sparse index rejects the second record collected in person. `prisma db push` builds it
  // non-sparse, which is why ensureDatabaseIndexes replaces one that it finds.
  { collection: 'InstrumentRecordModel', fields: ['assignmentId'], sparse: true, unique: true },
  { collection: 'InstrumentRecordModel', fields: ['subjectId', 'instrumentId', 'date'] },
  { collection: 'InstrumentRecordModel', fields: ['groupId', 'date'] },
  { collection: 'InstrumentRecordModel', fields: ['instrumentId'] },
  { collection: 'InstrumentRecordModel', fields: ['sessionId'] },
  { collection: 'InstrumentRepoModel', fields: ['url'], unique: true },
  { collection: 'SessionModel', fields: ['groupId', 'date'] },
  { collection: 'SessionModel', fields: ['subjectId'] },
  { collection: 'SubjectModel', fields: ['groupIds'] },
  { collection: 'UserModel', fields: ['username'], unique: true }
];

/** Reproduces Prisma's own naming, so a later `db push` reads the index as already satisfied. */
function buildIndexName({ collection, fields, unique }: DatabaseIndex): string {
  return `${collection}_${fields.join('_')}_${unique ? 'key' : 'idx'}`;
}

function buildIndexSpecification(index: DatabaseIndex): Prisma.InputJsonObject {
  return {
    key: Object.fromEntries(index.fields.map((field) => [field, 1])),
    name: buildIndexName(index),
    ...(index.sparse ? { sparse: true } : {}),
    ...(index.unique ? { unique: true } : {})
  };
}

/** An index MongoDB already holds under the required name, but built to a different specification. */
function isStale(existing: z.infer<typeof $IndexSpecification>, required: DatabaseIndex): boolean {
  const requiredKey = required.fields.map((field) => `${field}:1`).join(',');
  const existingKey = Object.entries(existing.key)
    .map(([field, direction]) => `${field}:${direction}`)
    .join(',');
  return (
    existingKey !== requiredKey ||
    Boolean(existing.sparse) !== Boolean(required.sparse) ||
    Boolean(existing.unique) !== Boolean(required.unique)
  );
}

async function listIndexes(
  client: RawCommandRunner,
  collection: string
): Promise<Map<string, z.infer<typeof $IndexSpecification>>> {
  let output: unknown;
  try {
    output = await client.$runCommandRaw({ listIndexes: collection });
  } catch (err) {
    if ((err as { code?: unknown })?.code === NAMESPACE_NOT_FOUND || String(err).includes('ns does not exist')) {
      return new Map();
    }
    throw err;
  }
  const result = $ListIndexesResult.safeParse(output);
  if (!result.success) {
    throw new Error(`Failed to parse listIndexes output for collection '${collection}'`, { cause: result.error });
  }
  return new Map(result.data.cursor.firstBatch.map((index) => [index.name, index]));
}

/**
 * Creates every index the services' queries depend on, and replaces any that MongoDB already holds
 * under the same name with a different specification.
 *
 * MongoDB creates a collection on first insert with only its `_id_` index, and this application
 * never runs `prisma db push` against a deployed database, so without this an upgraded instance
 * keeps scanning whole collections and enforces none of the schema's unique constraints.
 */
async function ensureDatabaseIndexes(client: RawCommandRunner): Promise<void> {
  const collections = [...new Set(DATABASE_INDEXES.map((index) => index.collection))];
  for (const collection of collections) {
    const required = DATABASE_INDEXES.filter((index) => index.collection === collection);
    const existing = await listIndexes(client, collection);
    for (const index of required) {
      const name = buildIndexName(index);
      const found = existing.get(name);
      if (found && isStale(found, index)) {
        await client.$runCommandRaw({ dropIndexes: collection, index: name });
      }
    }
    try {
      await client.$runCommandRaw({
        createIndexes: collection,
        indexes: required.map(buildIndexSpecification)
      });
    } catch (err) {
      throw new Error(
        `Failed to create indexes on collection '${collection}'. A unique index cannot be built while the collection holds duplicates; resolve them and restart.`,
        { cause: err }
      );
    }
  }
}

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
    await ensureDatabaseIndexes(client);
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

export { buildIndexName, DATABASE_INDEXES, ensureDatabaseIndexes };

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
