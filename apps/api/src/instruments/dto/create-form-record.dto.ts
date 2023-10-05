import type { FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { ApiProperty } from '@nestjs/swagger';
import type { FormInstrumentRecord, InstrumentKind, SubjectIdentificationData } from '@open-data-capture/types';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsObject, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';

import { SubjectIdentificationDataDto } from '@/subjects/dto/subject-identification-data.dto';

type CreateFormRecordData = {
  groupName?: string;
  instrumentName: string;
  instrumentVersion: number;
  subjectInfo: SubjectIdentificationData;
} & Omit<FormInstrumentRecord, 'group' | 'instrument' | 'subject'>;

export class CreateFormRecordDto implements CreateFormRecordData {
  @ApiProperty()
  @IsObject()
  data: FormInstrumentData;

  @ApiProperty()
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty()
  @IsString()
  instrumentName: string;

  @ApiProperty()
  @IsPositive()
  instrumentVersion: number;

  @ApiProperty()
  @IsIn(['form'] satisfies InstrumentKind[])
  kind: 'form';

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => SubjectIdentificationDataDto)
  subjectInfo: SubjectIdentificationDataDto;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  time: number;
}
