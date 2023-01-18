import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { BaseInstrumentInterface, InstrumentKind, instrumentKindOptions } from 'common';

import { InstrumentDetailsDto } from './instrument-details.dto';

export class BaseInstrumentDto implements BaseInstrumentInterface {
  @ApiProperty({
    description: 'The title of the instrument',
    example: 'The Happiness Questionnaire'
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The kind of instrument',
    enum: instrumentKindOptions
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(instrumentKindOptions)
  kind: InstrumentKind;

  @ApiProperty({
    description: 'Details regarding the instrument'
  })
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => InstrumentDetailsDto)
  details: InstrumentDetailsDto;
}
