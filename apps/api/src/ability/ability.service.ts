import { accessibleBy } from '@casl/mongoose';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { AppAbility, AppAction, User } from '@open-data-capture/types';
import type { Request } from 'express';

import { AbilityFactory } from './ability.factory';

@Injectable({ scope: Scope.REQUEST })
export class AbilityService {
  currentUser: User | null;
  userAbility: AppAbility | null;

  constructor(@Inject(REQUEST) request: Request, abilityFactory: AbilityFactory) {
    this.currentUser = request.user ?? null;
    this.userAbility = request.user ? abilityFactory.createForUser(request.user) : null;
  }

  createAccessibleQuery(action: AppAction) {
    if (this.userAbility) {
      return accessibleBy(this.userAbility, action);
    }
    return {};
  }
}
