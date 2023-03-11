import { InferSubjects } from '@casl/ability';

import { Group } from '@/groups/entities/group.entity';
import { User } from '@/users/entities/user.entity';

export type Actions = 'create' | 'read' | 'update' | 'delete';

export type Subjects = InferSubjects<typeof Group | typeof User, true>;
