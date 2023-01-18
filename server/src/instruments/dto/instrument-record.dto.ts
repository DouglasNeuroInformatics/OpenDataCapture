import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsNotEmpty, IsNotEmptyObject, IsString, ValidateNested } from 'class-validator';
import { InstrumentRecordInterface } from 'common';

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

export class InstrumentRecordDto implements InstrumentRecordInterface {
  dateCollected: Date;
  instrumentName: string;
  clinic: undefined;

  @ApiProperty({ type: SubjectDemographicsDto })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => SubjectDemographicsDto)
  subjectDemographics: SubjectDemographicsDto;

  @ApiProperty()
  @IsDefined()
  data: Record<string, any>;
}
