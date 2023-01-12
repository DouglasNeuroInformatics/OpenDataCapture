import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { InstrumentRecord } from 'common';

class SubjectDemographicsDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dateOfBirth: Date;
}

export class InstrumentRecordDto implements InstrumentRecord {
  @ValidateNested()
  subjectDemographics: SubjectDemographicsDto;

  @IsDefined()
  responses: Record<string, any>;
}
