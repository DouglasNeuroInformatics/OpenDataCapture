import type { EntityController } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Visit } from '@open-data-capture/types';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateVisitDto } from './dto/create-visit.dto';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController implements Pick<EntityController<Visit>, 'create'> {
  constructor(private readonly visitsService: VisitsService) {}

  @ApiOperation({ description: 'Create Visit' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Visit' })
  create(@Body() data: CreateVisitDto) {
    return this.visitsService.create(data);
  }
}
