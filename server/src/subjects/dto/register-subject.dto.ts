import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
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
  @IsOptional()
  @IsString()
  @Length(3)
  forwardSortationArea?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(demographicOptions.ethnicity)
  ethnicity?: SubjectDemographicsInterface['ethnicity'];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(demographicOptions.gender)
  gender?: SubjectDemographicsInterface['gender'];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(demographicOptions.employmentStatus)
  employmentStatus?: SubjectDemographicsInterface['employmentStatus'];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(demographicOptions.maritalStatus)
  maritalStatus?: SubjectDemographicsInterface['maritalStatus'];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(demographicOptions.firstLanguage)
  firstLanguage?: SubjectDemographicsInterface['firstLanguage'];
}
