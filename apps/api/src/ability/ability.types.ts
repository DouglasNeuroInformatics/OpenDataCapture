import type { PureAbility } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import type { AppAction, AppSubjectName } from '@open-data-capture/common';
import type { Group } from '@open-data-capture/database';

type AppSubject = AppSubjectName | Subjects<{
  Group: Group;
}>

export type AppAbility = PureAbility<[AppAction, AppSubject], PrismaQuery>;
