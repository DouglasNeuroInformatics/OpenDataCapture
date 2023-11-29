import type { ObjectIdLike } from '@douglasneuroinformatics/nestjs/modules';
import type { Sex } from '@open-data-capture/common/subject';

export class SubjectEntity {
  static readonly modelName = 'Subject';

  dateOfBirth: Date;

  firstName?: string;

  groupIds: ObjectIdLike[];

  identifier: string;

  lastName?: string;

  sex: Sex;
}
