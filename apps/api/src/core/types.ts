import type { PureAbility } from '@casl/ability';
import type { PrismaQuery } from '@casl/prisma';
import type {
  GroupModel,
  InstrumentRecordModel,
  SessionModel,
  SubjectModel,
  UserModel
} from '@opendatacapture/prisma-client/api';
import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';

type AppSubject = AppSubjectName | GroupModel | InstrumentRecordModel | SessionModel | SubjectModel | UserModel;

export type AppAbility = PureAbility<[AppAction, AppSubject], PrismaQuery>;

export type EntityOperationOptions = {
  ability?: AppAbility;
};
