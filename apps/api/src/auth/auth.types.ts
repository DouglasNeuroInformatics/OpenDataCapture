import { PureAbility } from '@casl/ability';
import type { RawRuleOf } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import { Prisma } from '@prisma/client';
import type { DefaultSelection } from '@prisma/client/runtime/library';

type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

type AppSubjects =
  | 'all'
  | Subjects<{
      [K in keyof Prisma.TypeMap['model']]: DefaultSelection<Prisma.TypeMap['model'][K]['payload']>;
    }>;

type AppSubjectName = Extract<AppSubjects, string>;

type AppAbilities = [AppAction, AppSubjects];

type AppAbility = PureAbility<AppAbilities, PrismaQuery>;

type Permission = RawRuleOf<PureAbility<[AppAction, AppSubjectName], PrismaQuery>>;

export type { AppAbilities, AppAbility, AppAction, AppSubjectName, Permission };
