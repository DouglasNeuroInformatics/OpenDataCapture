import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { InstrumentRecordDto } from './dto/instrument-record.dto';
import { InstrumentDto } from './dto/instrument.dto';
import { InstrumentsService } from './instruments.service';
import { InstrumentRecord } from './schemas/instrument-record.schema';

@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) { }

  @ApiOperation({ summary: 'Create a New Instrument' })
  @ApiCreatedResponse({ description: 'Successfully created new instrument' })
  @Post('schemas')
  create(@Body() dto: InstrumentDto): Promise<InstrumentDto> {
    return this.instrumentsService.create(dto);
  }

  @ApiOperation({ summary: 'Get All Instruments' })
  @ApiOkResponse({ description: 'Success', type: [InstrumentDto] })
  @Get('schemas')
  getAll(): Promise<InstrumentDto[]> {
    return this.instrumentsService.getAll();
  }

  @ApiOperation({ summary: 'Get Instrument by ID' })
  @ApiOkResponse({ description: 'Success', type: InstrumentDto })
  @Get('schemas/:id')
  getById(@Param('id') id: string): Promise<InstrumentDto> {
    return this.instrumentsService.getById(id);
  }

  @ApiOperation({ summary: 'Add Instrument Record' })
  @ApiCreatedResponse({ description: 'Successfully inserted new record' })
  @Post('records/:id')
  insertRecord(@Param('id') id: string, @Body() dto: InstrumentRecordDto): Promise<InstrumentRecord> {
    return this.instrumentsService.insertRecord(id, dto);
  }

  // Need to verify query
  @ApiOperation({ summary: 'Get Instrument Records' })
  @ApiOkResponse({ description: 'Success' })
  @Get('records')
  getRecords(
    @Query('instrument') instrumentId?: string,
    @Query('subject') subjectId?: string
  ): Promise<InstrumentRecord[]> {
    return this.instrumentsService.getRecords(instrumentId, subjectId);
  }
}
