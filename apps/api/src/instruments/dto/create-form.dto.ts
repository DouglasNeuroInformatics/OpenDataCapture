import type { FormInstrumentContent, FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { ApiProperty } from '@nestjs/swagger';
import type { FormInstrument, InstrumentKind } from '@open-data-capture/types';
import type { JSONSchemaType } from 'ajv';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsObject, IsPositive, IsString, ValidateNested } from 'class-validator';

import { FormDetailsDto } from './form-details.dto';

export class CreateFormDto implements FormInstrument {
  @ApiProperty()
  content: FormInstrumentContent;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => FormDetailsDto)
  details: FormDetailsDto;

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
  validationSchema: JSONSchemaType<FormInstrumentData>;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  version: number;
}
