import type { PureAbility } from '@casl/ability';
import type { PrismaQuery } from '@casl/prisma';
import type { AppAction, AppSubjectName } from '@open-data-capture/common/core';
import type {
  GroupModel,
  InstrumentRecordModel,
  SubjectModel,
  UserModel,
  VisitModel
} from '@open-data-capture/database/core';

type AppSubject =
  | AppSubjectName
  | GroupModel
  | InstrumentRecordModel
  | SubjectModel
  | UserModel
  | VisitModel;

export type AppAbility = PureAbility<[AppAction, AppSubject], PrismaQuery>;

export type EntityOperationOptions = {
  ability?: AppAbility;
};
