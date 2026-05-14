import { PureAbility } from '@casl/ability';
import type { RawRuleOf } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import { Prisma } from '@prisma/client';
import type { DefaultSelection } from '@prisma/client/runtime/library';

type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

type AppSubjectModels = {
  [K in keyof Prisma.TypeMap['model']]: DefaultSelection<Prisma.TypeMap['model'][K]['payload']>;
};

type AppSubjects = 'all' | Subjects<AppSubjectModels>;

type AppSubjectName = Extract<AppSubjects, string>;

type AppSubjectModel = Extract<AppSubjects, object>;

type AppAbilities = [AppAction, AppSubjects];

type AppAbility = PureAbility<AppAbilities, PrismaQuery>;

type Permission = RawRuleOf<PureAbility<[AppAction, AppSubjectName], PrismaQuery>>;

export type { AppAbilities, AppAbility, AppAction, AppSubjectModel, AppSubjectModels, AppSubjectName, Permission };
