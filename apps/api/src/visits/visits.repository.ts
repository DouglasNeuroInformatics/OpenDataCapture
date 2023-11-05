import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { VisitEntity } from './entities/visit.entity';

export class VisitsRepository extends EntityRepository(VisitEntity) {}
