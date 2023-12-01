import type { PureAbility } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import type { AppAction, AppSubjectName } from '@open-data-capture/common';
import type {
  GroupModel,
  InstrumentRecordModel,
  SubjectModel,
  UserModel,
  VisitModel
} from '@open-data-capture/database';

type AppSubject =
  | AppSubjectName
  | Subjects<{
      Group: GroupModel;
      InstrumentRecord: InstrumentRecordModel;
      Subject: SubjectModel;
      User: UserModel;
      Visit: VisitModel;
    }>;

export type AppAbility = PureAbility<[AppAction, AppSubject], PrismaQuery>;
