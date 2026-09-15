import * as fs from 'node:fs';
import * as path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { buildIndexName, DATABASE_INDEXES, ensureDatabaseIndexes } from '../prisma';

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
