import { InferSubjects, MongoAbility, RawRuleOf } from '@casl/ability';

import { GroupEntity } from '@/groups/entities/group.entity';
import { Instrument } from '@/instruments/entities/instrument.entity';
import { Subject as SubjectClass } from '@/subjects/entities/subject.entity';
import { User } from '@/users/entities/user.entity';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subject = InferSubjects<
  typeof GroupEntity | typeof User | typeof SubjectClass | typeof Instrument | 'all',
  true
>;

export type AppAbility = MongoAbility<[Action, Subject]>;

export type Permissions = RawRuleOf<AppAbility>[];

export type BasePermissionLevel = 'admin' | 'group-manager' | 'standard';
