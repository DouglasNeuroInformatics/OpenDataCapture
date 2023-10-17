import { AbilityFactory } from '@/ability/ability.factory';
import { accessibleBy } from '@casl/mongoose';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import type { AppAbility } from '@open-data-capture/types';
import type { Request } from 'express';
import type { FilterQuery, Model, Types } from 'mongoose';
import type { Class } from 'type-fest';

type EntityClass<TEntity extends object> = Class<TEntity> & { modelName: string };

export function EntityRepository<TEntity extends object>(entity: EntityClass<TEntity>) {
  @Injectable({ scope: Scope.REQUEST })
  abstract class BaseRepository {
    private readonly userAbility: AppAbility;

    constructor(
      @InjectModel(entity.modelName) private readonly model: Model<TEntity>,
      @Inject(REQUEST) request: Request,
      abilityFactory: AbilityFactory
    ) {
      if (!request.user) {
        throw new Error('Unexpected error: request.user is undefined');
      }
      this.userAbility = abilityFactory.createForUser(request.user);
    }

    create(entity: Omit<TEntity, 'id'>) {
      return this.model.create(entity);
    }

    async exists(filter: FilterQuery<TEntity>): Promise<boolean> {
      return (await this.model.exists(filter)) !== null;
    }

    find() {
      return this.model.find();
    }

    findAll() {
      return this.model.find();
    }

    findById(id: Types.ObjectId) {
      return this.model.findById(id);
    }
  }
  return BaseRepository;
}
