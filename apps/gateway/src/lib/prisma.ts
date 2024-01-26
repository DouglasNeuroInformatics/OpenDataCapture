import fs from 'node:fs/promises';

import { PrismaClient } from '@open-data-capture/database/gateway';

import { CONFIG } from '@/config';

await fs.mkdir(CONFIG.dataDir, { recursive: true });

export const prisma = new PrismaClient({
  datasourceUrl: `file:${CONFIG.dataDir}/${CONFIG.mode}.db`
});
