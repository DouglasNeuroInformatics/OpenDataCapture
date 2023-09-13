import { ApiProperty } from '@nestjs/swagger';

import type { FormInstrumentContent, FormInstrumentData } from '@douglasneuroinformatics/form-types';
import type { FormInstrument, InstrumentKind } from '@open-data-capture/types';
import type { JSONSchemaType } from 'ajv';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsObject, IsPositive, IsString, ValidateNested } from 'class-validator';

import { FormDetailsDto } from './form-details.dto.js';

export class CreateFormDto implements FormInstrument {
  @ApiProperty()
  @IsIn(['form'] satisfies InstrumentKind[])
  kind: 'form';

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  version: number;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => FormDetailsDto)
  details: FormDetailsDto;

  @ApiProperty()
  content: FormInstrumentContent;

  @ApiProperty()
  validationSchema: JSONSchemaType<FormInstrumentData>;
}
