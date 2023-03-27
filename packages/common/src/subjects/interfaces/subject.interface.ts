import { Sex } from '../enums/sex.enum';

export interface Subject {
  identifier: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: Date;
  sex: Sex;
}
