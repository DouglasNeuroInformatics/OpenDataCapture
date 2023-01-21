import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { SubjectDemographicsInterface, demographicOptions } from 'common';

export class RegisterSubjectDto implements SubjectDemographicsInterface {
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(demographicOptions.sex)
  sex: SubjectDemographicsInterface['sex'];

  @ApiPropertyOptional()
  @IsString()
  @Length(3)
  forwardSortationArea?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsIn(demographicOptions.ethnicity)
  ethnicity?: SubjectDemographicsInterface['ethnicity'];

  @ApiPropertyOptional()
  @IsString()
  @IsIn(demographicOptions.gender)
  gender?: SubjectDemographicsInterface['gender'];

  @ApiPropertyOptional()
  @IsString()
  @IsIn(demographicOptions.employmentStatus)
  employmentStatus?: SubjectDemographicsInterface['employmentStatus'];

  @ApiPropertyOptional()
  @IsString()
  @IsIn(demographicOptions.maritalStatus)
  maritalStatus?: SubjectDemographicsInterface['maritalStatus'];

  @ApiPropertyOptional()
  @IsString()
  @IsIn(demographicOptions.firstLanguage)
  firstLanguage?: SubjectDemographicsInterface['firstLanguage'];
}
