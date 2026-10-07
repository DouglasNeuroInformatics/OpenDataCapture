import { detectSubjectType, ForbiddenError, subject } from '@casl/ability';
import { accessibleBy, createPrismaAbility } from '@casl/prisma';
import type { AppSubject, Prisma } from '@prisma/client';

import type { PrismaModelWhereInputMap } from '@/core/prisma';

import type { AppAbility, AppAction, AppSubjectModels, AppSubjectName, Permission } from './auth.types';

export function detectAppSubject(obj: { [key: string]: any }) {
  if (typeof obj.__modelName === 'string') {
    return obj.__modelName as AppSubject;
  }
  return detectSubjectType(obj) as AppSubject;
}

export function forcedAppSubject<TSubjectName extends Exclude<AppSubjectName, 'all'>>(
  name: TSubjectName,
  obj: Partial<AppSubjectModels[TSubjectName]>
) {
  return subject(name, {
    __modelName: name,
    ...obj
  } as unknown as AppSubjectModels[TSubjectName]);
}

export function createAppAbility(permissions: Permission[]): AppAbility {
  return createPrismaAbility<AppAbility>(permissions, {
    detectSubjectType: detectAppSubject
  });
}

export function accessibleQuery<T extends Prisma.ModelName>(
  ability: AppAbility | undefined,
  action: AppAction,
  modelName: T
): NonNullable<PrismaModelWhereInputMap[T]> {
  if (!ability) {
    return {};
  }
  const query = accessibleBy(ability, action).ofType(modelName);
  // `ofType` returns `{ OR: [] }` exactly when no rule grants the action on the model, which is when
  // @casl/prisma 1 threw this error. Prisma ignores an empty `OR` nested in an `AND`
  // (prisma/prisma#17367), so passing it on would lift the restriction instead of applying it.
  if (query.OR?.length === 0) {
    const error = ForbiddenError.from(ability).setMessage(`It's not allowed to run "${action}" on "${modelName}"`);
    error.action = action;
    error.subject = error.subjectType = modelName;
    throw error;
  }
  return query;
}
