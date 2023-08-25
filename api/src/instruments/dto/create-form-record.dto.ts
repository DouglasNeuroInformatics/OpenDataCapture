import { ApiProperty } from '@nestjs/swagger';

import type { FormInstrumentRecord, InstrumentKind, SubjectIdentificationData } from '@ddcp/types';
import type { FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsObject, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';

import { SubjectIdentificationDataDto } from '@/subjects/dto/subject-identification-data.dto.js';

type CreateFormRecordData = {
  groupName?: string;
  instrumentName: string;
  instrumentVersion: number;
  subjectInfo: SubjectIdentificationData;
} & Omit<FormInstrumentRecord, 'group' | 'instrument' | 'subject'>

export class CreateFormRecordDto implements CreateFormRecordData {
  @ApiProperty()
  @IsIn(['form'] satisfies InstrumentKind[])
  kind: 'form';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  time: number;

  @ApiProperty()
  @IsString()
  instrumentName: string;

  @ApiProperty()
  @IsPositive()
  instrumentVersion: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => SubjectIdentificationDataDto)
  subjectInfo: SubjectIdentificationDataDto;

  @ApiProperty()
  @IsObject()
  data: FormInstrumentData;
}
