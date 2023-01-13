import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Instrument } from 'common';

import { InstrumentRecordDto } from './dto/instrument-record.dto';
import { InstrumentDto } from './dto/instrument.dto';
import { InstrumentsService } from './instruments.service';
import { InstrumentRecord } from './schemas/instrument-record.schema';

@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @ApiOperation({ summary: 'Create a New Instrument Schema' })
  @Post('schemas')
  create(@Body() dto: InstrumentDto): Promise<InstrumentDto> {
    return this.instrumentsService.create(dto);
  }

  @ApiOperation({ summary: 'Get All Instrument Schemas' })
  @Get('schemas')
  @ApiOkResponse({ description: 'Success' })
  getAll(): Promise<Instrument[]> {
    return this.instrumentsService.getAll();
  }

  @Get('schemas/:id')
  getById(@Param('id') id: string): Promise<Instrument> {
    return this.instrumentsService.getById(id);
  }

  @Post('records/:id')
  insertRecord(@Param('id') id: string, @Body() dto: InstrumentRecordDto): Promise<any> {
    return this.instrumentsService.insertRecord(id, dto);
  }

  // Need to verify query
  @Get('records')
  getRecords(
    @Query('instrument') instrumentId?: string,
    @Query('subject') subjectId?: string
  ): Promise<InstrumentRecord[]> {
    return this.instrumentsService.getRecords(instrumentId, subjectId);
  }
}
