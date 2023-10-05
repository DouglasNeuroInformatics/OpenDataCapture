import { ApiProperty } from '@nestjs/swagger';
import type { FormDetails, Language } from '@open-data-capture/types';
import { IsDefined, IsIn, IsNumber, IsPositive, IsString } from 'class-validator';

export class FormDetailsDto implements FormDetails {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  estimatedDuration: number;

  @ApiProperty()
  @IsDefined()
  instructions: string | string[];

  @ApiProperty()
  @IsIn(['en', 'fr'] satisfies Language[])
  language: Language;

  @ApiProperty()
  @IsString()
  title: string;
}
