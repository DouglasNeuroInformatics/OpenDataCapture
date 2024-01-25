import { JSONFilePreset } from 'lowdb/node';

import { CONFIG } from '@/config';
import type { Assignment } from '@open-data-capture/common/assignment';

export const db = await JSONFilePreset<{
  assignments: Assignment[];
}>(CONFIG.datasource, { assignments: [] });
