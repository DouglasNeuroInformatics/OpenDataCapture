import { accessibleBy } from '@casl/mongoose';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { AppAbility, AppAction, AppSubject, User } from '@open-data-capture/types';
import type { Request } from 'express';
import type { FilterQuery } from 'mongoose';

import { AbilityFactory } from './ability.factory';

@Injectable({ scope: Scope.REQUEST })
export class AbilityService {
  currentUser: User | null;
  userAbility: AppAbility | null;

  constructor(@Inject(REQUEST) request: Request, abilityFactory: AbilityFactory) {
    this.currentUser = request.user ?? null;
    this.userAbility = request.user ? abilityFactory.createForUser(request.user) : null;
  }

  accessibleQuery<T>(action: AppAction, filter?: FilterQuery<T>): FilterQuery<T> {
    if (this.userAbility) {
      return filter
        ? {
            $and: [accessibleBy(this.userAbility, action), filter]
          }
        : accessibleBy(this.userAbility, action);
    }
    return {};
  }

  can(action: AppAction, subject: AppSubject) {
    return this.userAbility === null || this.userAbility.can(action, subject);
  }
}
