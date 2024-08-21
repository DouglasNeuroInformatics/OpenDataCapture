import type { PureAbility } from '@casl/ability';
import type { PrismaQuery } from '@casl/prisma';
import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';

import type { GroupModel, InstrumentRecordModel, SessionModel, SubjectModel, UserModel } from '.prisma/client';

type AppSubject = AppSubjectName | GroupModel | InstrumentRecordModel | SessionModel | SubjectModel | UserModel;

export type AppAbility = PureAbility<[AppAction, AppSubject], PrismaQuery>;

export type EntityOperationOptions = {
  ability?: AppAbility;
};
