import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { InstrumentsService } from './instruments.service';
import { Instrument } from './entities/instrument.entity';

import { EntityController } from '@/core/abstract/entity.controller';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentsController implements EntityController<Instrument> {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @ApiOperation({ summary: 'Create a New Instrument' })
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  @Post()
  create(@Body() createInstrumentDto: CreateInstrumentDto): Promise<Instrument> {
    return this.instrumentsService.create(createInstrumentDto);
  }

  @ApiOperation({ summary: 'Get All Available Instruments' })
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  @Get()
  findAll(): Promise<Instrument[]> {
    return this.instrumentsService.findAll();
  }
}
