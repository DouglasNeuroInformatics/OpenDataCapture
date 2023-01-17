import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { InstrumentRecord } from 'common';

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

export class InstrumentRecordDto implements InstrumentRecord {
  @ApiProperty({ type: SubjectDemographicsDto })
  @ValidateNested()
  @Type(() => SubjectDemographicsDto)
  subjectDemographics: SubjectDemographicsDto;

  @ApiProperty()
  @IsDefined()
  responses: Record<string, any>;
}
