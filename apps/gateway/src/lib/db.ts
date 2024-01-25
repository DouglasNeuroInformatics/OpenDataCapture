import { JSONFilePreset } from 'lowdb/node';

import { CONFIG } from '@/config';

const db = await JSONFilePreset<{
  assignments: any[];
}>(CONFIG.datasource, { assignments: [] });

await db.update(({ assignments }) => assignments.push('hello world'));
