import type { Sex, SubjectIdentificationData } from '@open-data-capture/types';
import { IsDateString, IsIn, IsString } from 'class-validator';

export class SubjectIdentificationDataDto implements SubjectIdentificationData {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsIn(['male', 'female'] satisfies Sex[])
  sex: Sex;
}
