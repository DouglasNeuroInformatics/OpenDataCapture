import { PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import { beforeAll, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { ensureDatabaseIndexes } from '@/core/prisma';
import type { RuntimePrismaClient } from '@/core/prisma';

import { defineSuite } from '../helpers';

const COLLECTION = 'InstrumentRecordModel';
const PLAIN_INDEX = 'InstrumentRecordModel_assignmentId_idx';
const RETIRED_INDEX = 'InstrumentRecordModel_assignmentId_key';

const $ListIndexesResult = z.object({
  cursor: z.object({ firstBatch: z.array(z.object({ name: z.string() })) })
});

export default defineSuite('retired indexes', function () {
  let prisma: RuntimePrismaClient;

  const listIndexNames = async () => {
    const { cursor } = $ListIndexesResult.parse(await prisma.$runCommandRaw({ listIndexes: COLLECTION }));
    return cursor.firstBatch.map(({ name }) => name);
  };

  beforeAll(() => {
    prisma = this.app.get(PRISMA_CLIENT_TOKEN);
  });

  // Setup drops the database, and with it every index built at boot, so this starts from the indexes
  // this release builds and swaps the plain one for the sparse unique index an earlier release left.
  it('should replace the unique assignmentId index a database built by an earlier release holds', async () => {
    await ensureDatabaseIndexes(prisma);
    await prisma.$runCommandRaw({ dropIndexes: COLLECTION, index: PLAIN_INDEX });
    await prisma.$runCommandRaw({
      createIndexes: COLLECTION,
      indexes: [{ key: { assignmentId: 1 }, name: RETIRED_INDEX, sparse: true, unique: true }]
    });
    expect(await listIndexNames()).toContain(RETIRED_INDEX);

    await ensureDatabaseIndexes(prisma);

    const names = await listIndexNames();
    expect(names).toContain(PLAIN_INDEX);
    expect(names).not.toContain(RETIRED_INDEX);
  });
});
