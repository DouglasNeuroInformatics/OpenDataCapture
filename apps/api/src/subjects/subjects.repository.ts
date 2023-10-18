import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { SubjectEntity } from './entities/subject.entity';

export class SubjectsRepository extends EntityRepository(SubjectEntity) {}
