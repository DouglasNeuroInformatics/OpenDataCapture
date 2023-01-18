import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import {
  FormInstrumentFieldInterface,
  FormInstrumentFieldVariant,
  FormInstrumentInterface,
  formInstrumentFieldVariantOptions
} from 'common';

import { BaseInstrumentDto } from './base-instrument.dto';

export class FormInstrumentFieldDto implements FormInstrumentFieldInterface {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsIn(formInstrumentFieldVariantOptions)
  variant: FormInstrumentFieldVariant;

  @IsDefined()
  @IsBoolean()
  @Type(() => Boolean)
  isRequired: boolean;
}

export class FormInstrumentDto extends BaseInstrumentDto implements FormInstrumentInterface {
  @ApiProperty()
  kind: 'form';

  @ApiProperty()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => FormInstrumentFieldDto)
  data: FormInstrumentFieldDto[];
}
