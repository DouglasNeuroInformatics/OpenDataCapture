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
import type { Merge } from 'type-fest';

type AppModel<T extends object, U extends string> = T extends any ? Merge<T, { __model__: U }> : never;

type T = AppModel<{ foo: string }, 'Foo'>;

type AppSubject = AppSubjectName | GroupModel | InstrumentRecordModel | SubjectModel | UserModel | VisitModel;

export type AppAbility = PureAbility<[AppAction, AppSubject], PrismaQuery>;

export type EntityOperationOptions = {
  ability?: AppAbility;
};
