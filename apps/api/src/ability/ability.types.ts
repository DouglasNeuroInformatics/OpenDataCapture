import type { Subjects } from '@casl/prisma';
import type { Group } from '@open-data-capture/database';

export type T = Subjects<{
  Group: Group
}>;
