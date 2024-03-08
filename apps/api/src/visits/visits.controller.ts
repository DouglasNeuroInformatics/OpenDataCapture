import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Visit } from '@open-data-capture/common/visit';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateVisitDto } from './dto/create-visit.dto';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @ApiOperation({ description: 'Create Visit' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Visit' })
  create(@Body() data: CreateVisitDto): Promise<Visit> {
    return this.visitsService.create(data);
  }
}
