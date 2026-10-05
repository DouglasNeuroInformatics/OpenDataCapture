import * as fs from 'node:fs';
import * as path from 'node:path';

import { ConfigService } from '@douglasneuroinformatics/libnest';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildIndexName, DATABASE_INDEXES, ensureDatabaseIndexes, PrismaModuleOptionsFactory } from '../prisma';

/** Stands in for the extended client, recording the options each `new PrismaClient` received. */
const prismaClient = vi.hoisted(() => {
  const constructorOptions: unknown[] = [];
  return { $connect: vi.fn(), $runCommandRaw: vi.fn(), constructorOptions };
});

vi.mock('@prisma/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@prisma/client')>()),
  PrismaClient: class {
    constructor(options: unknown) {
      prismaClient.constructorOptions.push(options);
    }
    $extends() {
      return prismaClient;
    }
  }
}));

/** Only `getUri` and `stop` are used on the replica set the factory starts. */
const createReplSet = vi.hoisted(() =>
  vi.fn<(options: unknown) => Promise<{ getUri: (db: string) => string; stop: () => Promise<boolean> }>>()
);

vi.mock('mongodb-memory-server', () => ({
  MongoMemoryReplSet: { create: createReplSet }
}));

type IndexSpecification = {
  key: { [field: string]: number };
  name: string;
  sparse?: boolean;
  unique?: boolean;
};

/**
 * A client whose listIndexes reports `existing`, recording every command it is asked to run. A
 * collection named in `rejectCreateOn` fails its createIndexes, as a duplicate would make it.
 */
function mockClient(existing: { [collection: string]: IndexSpecification[] } = {}, rejectCreateOn?: string) {
  const commands: { [key: string]: any }[] = [];
  const $runCommandRaw = vi.fn((command: { [key: string]: any }) => {
    commands.push(command);
    if (typeof command.listIndexes === 'string') {
      const indexes = existing[command.listIndexes];
      if (!indexes) {
        throw Object.assign(new Error('ns does not exist'), { code: 26 });
      }
      return Promise.resolve({ cursor: { firstBatch: [{ key: orderedKey('_id'), name: '_id_' }, ...indexes] } });
    }
    if (rejectCreateOn && command.createIndexes === rejectCreateOn) {
      throw new Error('E11000 duplicate key error');
    }
    return Promise.resolve({ ok: 1 });
  });
  return { client: { $runCommandRaw }, commands };
}

/** Built from a list because `perfectionist/sort-objects` alphabetizes an object literal, and the
 * order of an index's fields is the thing under test. */
const orderedKey = (...fields: string[]): { [field: string]: number } =>
  Object.fromEntries(fields.map((field) => [field, 1]));

const createdIndexes = (commands: { [key: string]: any }[], collection: string): IndexSpecification[] =>
  commands.find((command) => command.createIndexes === collection)?.indexes ?? [];

const findIndex = (commands: { [key: string]: any }[], collection: string, name: string) =>
  createdIndexes(commands, collection).find((index) => index.name === name);

describe('buildIndexName', () => {
  // db push drops an index the schema does not name, so a name that differs from Prisma's leaves
  // two copies of the same index and the application's one is deleted on the next push.
  it('should reproduce the suffix prisma db push gives a non-unique index', () => {
    expect(buildIndexName({ collection: 'SessionModel', fields: ['groupId', 'date'] })).toBe(
      'SessionModel_groupId_date_idx'
    );
  });

  it('should reproduce the suffix prisma db push gives a unique index', () => {
    expect(buildIndexName({ collection: 'UserModel', fields: ['username'], unique: true })).toBe(
      'UserModel_username_key'
    );
  });
});

describe('ensureDatabaseIndexes', () => {
  it('should create every declared index', async () => {
    const { client, commands } = mockClient();
    await ensureDatabaseIndexes(client);
    const created = commands
      .filter((command) => typeof command.createIndexes === 'string')
      .flatMap((command) => command.indexes.map((index: IndexSpecification) => index.name));
    expect(created).toEqual(expect.arrayContaining(DATABASE_INDEXES.map(buildIndexName)));
    expect(created).toHaveLength(DATABASE_INDEXES.length);
  });

  it('should issue one createIndexes command per collection, rather than one per index', async () => {
    const { client, commands } = mockClient();
    await ensureDatabaseIndexes(client);
    const collections = commands
      .filter((command) => typeof command.createIndexes === 'string')
      .map((command) => command.createIndexes);
    expect(collections).toHaveLength(new Set(collections).size);
  });

  // MongoDB indexes a missing field as null, so a non-sparse unique index on the optional
  // assignmentId rejects the second record collected outside a remote assignment.
  it('should build the assignmentId unique index sparse, so records without an assignment do not collide', async () => {
    const { client, commands } = mockClient();
    await ensureDatabaseIndexes(client);
    expect(findIndex(commands, 'InstrumentRecordModel', 'InstrumentRecordModel_assignmentId_key')).toMatchObject({
      sparse: true,
      unique: true
    });
  });

  it('should order the fields of a compound index as declared, since a reordering serves other queries', async () => {
    const { client, commands } = mockClient();
    await ensureDatabaseIndexes(client);
    const index = findIndex(commands, 'InstrumentRecordModel', 'InstrumentRecordModel_subjectId_instrumentId_date_idx');
    expect(Object.keys(index!.key)).toEqual(['subjectId', 'instrumentId', 'date']);
  });

  it('should not drop an index that already matches, so a restart does not rebuild the collection', async () => {
    const { client, commands } = mockClient({
      SessionModel: [{ key: orderedKey('groupId', 'date'), name: 'SessionModel_groupId_date_idx' }]
    });
    await ensureDatabaseIndexes(client);
    expect(commands.filter((command) => command.dropIndexes === 'SessionModel')).toHaveLength(0);
  });

  // This is the repair path for a database that prisma db push has already been run against.
  it('should replace a non-sparse assignmentId index, which db push leaves behind and inserts fail on', async () => {
    const { client, commands } = mockClient({
      InstrumentRecordModel: [
        { key: orderedKey('assignmentId'), name: 'InstrumentRecordModel_assignmentId_key', unique: true }
      ]
    });
    await ensureDatabaseIndexes(client);
    expect(commands).toContainEqual({
      dropIndexes: 'InstrumentRecordModel',
      index: 'InstrumentRecordModel_assignmentId_key'
    });
    expect(findIndex(commands, 'InstrumentRecordModel', 'InstrumentRecordModel_assignmentId_key')).toMatchObject({
      sparse: true
    });
  });

  it('should replace an index whose fields are in a different order', async () => {
    const { client, commands } = mockClient({
      SessionModel: [{ key: orderedKey('date', 'groupId'), name: 'SessionModel_groupId_date_idx' }]
    });
    await ensureDatabaseIndexes(client);
    expect(commands).toContainEqual({ dropIndexes: 'SessionModel', index: 'SessionModel_groupId_date_idx' });
  });

  it('should treat a collection that does not exist yet as having no indexes', async () => {
    const { client, commands } = mockClient();
    await expect(ensureDatabaseIndexes(client)).resolves.toBeUndefined();
    expect(commands.some((command) => typeof command.createIndexes === 'string')).toBe(true);
  });

  // Duplicates block a unique index build, and continuing would leave the instance unindexed.
  it('should fail loudly when an index cannot be built, naming the collection', async () => {
    const { client } = mockClient({}, 'UserModel');
    await expect(ensureDatabaseIndexes(client)).rejects.toThrow(/UserModel/);
  });

  it('should replace an index that differs from the declaration only in uniqueness', async () => {
    const { client, commands } = mockClient({
      SessionModel: [{ key: orderedKey('groupId', 'date'), name: 'SessionModel_groupId_date_idx', unique: true }]
    });
    await ensureDatabaseIndexes(client);
    expect(commands).toContainEqual({ dropIndexes: 'SessionModel', index: 'SessionModel_groupId_date_idx' });
  });

  // Some server versions report a missing namespace by message alone, without the numeric code.
  it('should recognize a missing collection by its message when MongoDB reports no error code', async () => {
    const client = {
      $runCommandRaw: vi.fn((command: { [key: string]: unknown }) =>
        'listIndexes' in command
          ? Promise.reject(new Error('ns does not exist: test.UserModel'))
          : Promise.resolve({ ok: 1 })
      )
    };
    await expect(ensureDatabaseIndexes(client)).resolves.toBeUndefined();
  });

  it('should propagate any other failure to list indexes, rather than rebuilding indexes it cannot see', async () => {
    const failure = Object.assign(new Error('not authorized'), { code: 13 });
    const client = { $runCommandRaw: vi.fn(() => Promise.reject(failure)) };
    await expect(ensureDatabaseIndexes(client)).rejects.toBe(failure);
  });

  it('should fail loudly when listIndexes returns an unexpected shape, naming the collection', async () => {
    const client = { $runCommandRaw: vi.fn(() => Promise.resolve({ ok: 1 })) };
    await expect(ensureDatabaseIndexes(client)).rejects.toThrow(
      "Failed to parse listIndexes output for collection 'AssignmentModel'"
    );
  });
});

describe('PrismaModuleOptionsFactory', () => {
  const externalEnv = {
    MONGO_DIRECT_CONNECTION: true,
    MONGO_REPLICA_SET: 'rs0',
    MONGO_RETRY_WRITES: false,
    MONGO_URI: new URL('mongodb://db.example.org:27017'),
    MONGO_WRITE_CONCERN: 'majority',
    NODE_ENV: 'production'
  };

  const createFactory = async (env: { [key: string]: unknown }) => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaModuleOptionsFactory, { provide: ConfigService, useValue: { get: (key: string) => env[key] } }]
    }).compile();
    return moduleRef.get(PrismaModuleOptionsFactory);
  };

  const lastDatasourceUrl = () => {
    const options = prismaClient.constructorOptions.at(-1);
    return options && typeof options === 'object' && 'datasourceUrl' in options ? options.datasourceUrl : undefined;
  };

  beforeEach(() => {
    prismaClient.constructorOptions.length = 0;
    prismaClient.$connect.mockReset();
    prismaClient.$runCommandRaw.mockReset();
    prismaClient.$runCommandRaw.mockImplementation(mockClient().client.$runCommandRaw);
    createReplSet.mockReset();
  });

  it('should connect to a fresh in-memory replica set under test, so tests never touch a real database', async () => {
    createReplSet.mockResolvedValueOnce({
      getUri: (db) => `mongodb://127.0.0.1:41234/${db}?replicaSet=rs0`,
      stop: vi.fn()
    });
    await (await createFactory({ NODE_ENV: 'test' })).create();
    expect(createReplSet).toHaveBeenCalledExactlyOnceWith({ replSet: { count: 1, name: 'rs0' } });
    expect(lastDatasourceUrl()).toBe('mongodb://127.0.0.1:41234/test?replicaSet=rs0');
  });

  it('should connect to the configured database for the environment, passing only the options that are set', async () => {
    await (await createFactory(externalEnv)).create();
    expect(lastDatasourceUrl()).toBe(
      'mongodb://db.example.org:27017/data-capture-production?directConnection=true&replicaSet=rs0&w=majority'
    );
  });

  it('should not start an in-memory replica set outside tests', async () => {
    await (await createFactory(externalEnv)).create();
    expect(createReplSet).not.toHaveBeenCalled();
  });

  it('should omit password hashes from every user query by default, so none reaches a response by accident', async () => {
    await (await createFactory(externalEnv)).create();
    expect(prismaClient.constructorOptions.at(-1)).toMatchObject({ omit: { user: { hashedPassword: true } } });
  });

  it('should connect and reconcile indexes before handing out the client', async () => {
    const options = await (await createFactory(externalEnv)).create();
    expect(prismaClient.$connect).toHaveBeenCalledOnce();
    expect(prismaClient.$runCommandRaw).toHaveBeenCalledWith(expect.objectContaining({ createIndexes: 'UserModel' }));
    expect(options).toStrictEqual({ client: prismaClient });
  });

  it('should stop the in-memory replica set on shutdown, so no mongod outlives the application', async () => {
    const stop = vi.fn(() => Promise.resolve(true));
    createReplSet.mockResolvedValueOnce({ getUri: (db) => `mongodb://127.0.0.1:41234/${db}`, stop });
    const factory = await createFactory({ NODE_ENV: 'test' });
    await factory.create();
    await factory.onApplicationShutdown();
    expect(stop).toHaveBeenCalledOnce();
  });

  it('should shut down cleanly when it started no in-memory replica set', async () => {
    const factory = await createFactory(externalEnv);
    await factory.create();
    await expect(factory.onApplicationShutdown()).resolves.toBeUndefined();
  });
});

/**
 * db push drops any index schema.prisma does not declare, and creates any it does. Either list
 * drifting from the other silently loses an index on the next push.
 */
describe('agreement with schema.prisma', () => {
  const schema = fs.readFileSync(path.resolve(import.meta.dirname, '../../../prisma/schema.prisma'), 'utf-8');

  const declaredIndexes = [...schema.matchAll(/model\s+\w+\s*\{([\s\S]*?)\n\}/g)].flatMap(([, body]) => {
    const collection = /@@map\("(\w+)"\)/.exec(body!)?.[1];
    const compound = [...body!.matchAll(/@@(index|unique)\(\[([^\]]+)\]\)/g)].map(([, kind, fields]) => ({
      fields: fields!.split(',').map((field) => field.trim()),
      unique: kind === 'unique'
    }));
    const scalar = [...body!.matchAll(/^ {2}(\w+) +\S+ +[^\n]*@unique/gm)].map(([, field]) => ({
      fields: [field!],
      unique: true
    }));
    return [...compound, ...scalar].map((index) => ({ ...index, collection }));
  });

  const identify = (index: { collection?: string; fields: string[]; unique?: boolean }) =>
    `${index.collection}[${index.fields.join(',')}]${index.unique ? ' unique' : ''}`;

  it('should declare in schema.prisma every index the application creates', () => {
    expect(declaredIndexes.map(identify).toSorted()).toEqual(
      expect.arrayContaining(DATABASE_INDEXES.map(identify).toSorted())
    );
  });

  it('should create at runtime every index schema.prisma declares', () => {
    expect(DATABASE_INDEXES.map(identify).toSorted()).toEqual(declaredIndexes.map(identify).toSorted());
  });
});
