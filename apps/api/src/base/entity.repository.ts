import { accessibleBy } from '@casl/mongoose';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ForbiddenException, NotFoundException } from '@nestjs/common/exceptions';
import { REQUEST } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import type { AppAbility, AppAction, AppEntity, AppEntityClass, User } from '@open-data-capture/types';
import type { Request } from 'express';
import { type FilterQuery, type Model } from 'mongoose';

import { AbilityFactory } from '@/ability/ability.factory';

export function EntityRepository<TEntity extends AppEntity>(entity: AppEntityClass<TEntity>) {
  @Injectable({ scope: Scope.REQUEST })
  abstract class BaseRepository {
    // These will be null for public routes
    private currentUser: User | null;
    private userAbility: AppAbility | null;

    constructor(
      @InjectModel(entity.modelName) private readonly model: Model<TEntity>,
      @Inject(REQUEST) request: Request,
      abilityFactory: AbilityFactory
    ) {
      this.currentUser = request.user ?? null;
      this.userAbility = request.user ? abilityFactory.createForUser(request.user) : null;
    }

    async create(obj: Omit<TEntity, 'id'>) {
      if (this.userAbility && !this.userAbility.can('create', entity.modelName)) {
        throw new ForbiddenException(
          `User '${this.currentUser?.username}' does not have permission to create '${entity.modelName}'`
        );
      }
      return this.model.create(obj);
    }

    async deleteById(id: string) {
      const doc = await this.findAccessibleDoc(id, 'delete');
      await doc.deleteOne();
      await doc.save();
    }

    async exists(filter: FilterQuery<TEntity>): Promise<boolean> {
      return (await this.model.exists(filter)) !== null;
    }

    find(filter: FilterQuery<TEntity> = {}) {
      return this.model.find(this.createAccessibleFilter('read', filter));
    }

    findById(id: string) {
      return this.findAccessibleDoc(id, 'read');
    }

    async updateById(id: string, update: Partial<Omit<TEntity, 'id'>>) {
      const doc = await this.findAccessibleDoc(id, 'update');
      await doc.updateOne(update);
      await doc.save();
    }

    /** Merge the provided filter with the current user's ability */
    private createAccessibleFilter(action: AppAction, filter: FilterQuery<TEntity>) {
      if (!this.userAbility) {
        return filter;
      }
      return { $and: [filter, accessibleBy(this.userAbility, action)] };
    }

    private async findAccessibleDoc(id: string, action: AppAction) {
      const doc = await this.model.findById(id).exec();
      if (!doc) {
        throw new NotFoundException(`Failed to find entity '${entity.modelName}' with id '${id}'`);
      } else if (this.userAbility && !this.userAbility.can(action, doc)) {
        throw new ForbiddenException('Insufficient permissions to perform requested operation');
      }
      return doc;
    }
  }
  return BaseRepository;
}
