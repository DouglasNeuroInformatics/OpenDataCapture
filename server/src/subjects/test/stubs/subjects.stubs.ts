import { CreateSubjectDto } from '@/subjects/dto/create-subject.dto';

export const mockCreateSubjectDto: CreateSubjectDto = Object.freeze({
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: new Date(1980, 0),
  sex: 'female'
});
