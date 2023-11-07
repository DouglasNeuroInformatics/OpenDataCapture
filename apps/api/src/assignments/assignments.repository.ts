import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { AssignmentEntity } from './entities/assignment.entity';

export class AssignmentsRepository extends EntityRepository(AssignmentEntity) {}
