import { RegisterSubjectDto } from '@/subjects/dto/register-subject.dto';

export const mockRegisterSubjectDto: RegisterSubjectDto = Object.freeze({
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: new Date(1980, 0),
  sex: 'female'
});
