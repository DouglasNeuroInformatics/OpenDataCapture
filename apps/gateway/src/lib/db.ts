import fs from 'node:fs/promises';
import path from 'node:path';

import { JSONFilePreset } from 'lowdb/node';

import { CONFIG } from '@/config';
import type { Assignment } from '@open-data-capture/common/assignment';

const dataDir = path.dirname(CONFIG.datasource);
await fs.mkdir(dataDir, { recursive: true });

export const db = await JSONFilePreset<{
  assignments: Assignment[];
}>(CONFIG.datasource, { assignments: [] });
