import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FormInstrumentDto } from './dto/form-instrument.dto';
import { InstrumentRecordDto, InstrumentRecordExportDto } from './dto/instrument-record.dto';
import { InstrumentsService } from './instruments.service';
import { InstrumentRecord } from './schemas/instrument-record.schema';
import { Instrument } from './schemas/instrument.schema';

@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @ApiOperation({ summary: 'Create a New Form Instrument' })
  @ApiCreatedResponse({ description: 'Successfully created new instrument' })
  @Post('create-form')
  createForm(@Body() dto: FormInstrumentDto): Promise<Instrument> {
    return this.instrumentsService.createForm(dto);
  }

  @ApiOperation({ summary: 'Get Available Instruments' })
  @ApiOkResponse({ description: 'Success', type: [Instrument] })
  @Get('available')
  getAvailableInstruments(): Promise<Omit<Instrument, 'data'>[]> {
    return this.instrumentsService.getAvailableInstruments();
  }

  @ApiOperation({ summary: 'Get Instrument' })
  @ApiOkResponse({ description: 'Success', type: Instrument })
  @Get('archive/:title')
  getInstrument(@Param('title') title: string): Promise<Instrument> {
    return this.instrumentsService.getInstrument(title);
  }

  @ApiOperation({ summary: 'Insert Record' })
  @ApiCreatedResponse({ description: 'Successfully inserted new record' })
  @Post('records/:title')
  createRecord(@Param('title') title: string, @Body() dto: InstrumentRecordDto): Promise<InstrumentRecord> {
    return this.instrumentsService.createRecord(title, dto);
  }

  @ApiOperation({ summary: 'Get Instruments with Records' })
  @ApiOkResponse({ description: 'Success' })
  @Get('records/available')
  async getAvailableInstrumentRecords(@Query('subject') subjectIdentifier: string): Promise<any> {
    return this.instrumentsService.getAvailableInstrumentRecords(subjectIdentifier);
  }

  @Get('records/export')
  exportRecords(): Promise<InstrumentRecordExportDto[]> {
    return this.instrumentsService.exportRecords();
  }

  @ApiOperation({ summary: 'Get Instrument Records' })
  @ApiOkResponse({ description: 'Success' })
  @Get('records')
  getRecords(
    @Query('instrument') instrumentTitle?: string,
    @Query('subject') subjectIdentifier?: string
  ): Promise<InstrumentRecord[]> {
    return this.instrumentsService.getRecords(instrumentTitle, subjectIdentifier);
  }
}
