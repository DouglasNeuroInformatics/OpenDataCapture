import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsNotEmpty, IsNotEmptyObject, IsString, ValidateNested } from 'class-validator';

class SubjectDemographicsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dateOfBirth: Date;
}

export class InstrumentRecordDto {
  @ApiPropertyOptional()
  dateCollected?: Date;

  @ApiProperty({ type: SubjectDemographicsDto })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => SubjectDemographicsDto)
  subjectDemographics: SubjectDemographicsDto;

  @ApiProperty()
  @IsDefined()
  data: Record<string, any>;
}

export class InstrumentRecordExportDto {
  subjectId: string;
  subjectAge: number;
  subjectSex: string;
  instrument: string;
  measure: string;
  value: any;
}
