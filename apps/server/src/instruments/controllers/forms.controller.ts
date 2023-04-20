import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { FormInstrument, FormInstrumentSummary } from '@douglasneuroinformatics/common';

import { CreateFormDto } from '../dto/create-form.dto';
import { FormsService } from '../services/forms.service';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Instruments')
@Controller('instruments/forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({ description: 'Create a new form instrument' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() createFormDto: CreateFormDto): Promise<FormInstrument> {
    return this.formsService.create(createFormDto);
  }

  @ApiOperation({ description: 'Returns all forms in the database' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findAll(): Promise<FormInstrument[]> {
    return this.formsService.findAll();
  }

  @ApiOperation({ description: 'Returns a summary of all available forms' })
  @Get('available')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  getAvailable(): Promise<FormInstrumentSummary[]> {
    return this.formsService.getAvailable();
  }

  @ApiOperation({ description: 'Returns the provided form' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findOne(@Param('id') id: string): Promise<FormInstrument> {
    return this.formsService.findById(id);
  }

  @ApiOperation({ description: 'Returns the deleted instrument ' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Instrument' })
  remove(@Param('id') id: string): Promise<FormInstrument> {
    return this.formsService.remove(id);
  }
}
