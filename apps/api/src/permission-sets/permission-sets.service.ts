import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { $CreatePermissionSetData, $UpdatePermissionSetData } from '@opendatacapture/schemas/permission-set';

import { accessibleQuery } from '@/auth/ability.utils';
import type { EntityOperationOptions } from '@/core/types';

const INCLUDE_HOLDER_COUNT = { _count: { select: { users: true } } } as const;

function withHolderCount<TPermissionSet extends { _count: { users: number } }>({
  _count,
  ...permissionSet
}: TPermissionSet) {
  return { ...permissionSet, holderCount: _count.users };
}

@Injectable()
export class PermissionSetsService {
  constructor(@InjectModel('PermissionSet') private readonly permissionSetModel: Model<'PermissionSet'>) {}

  async create({ name, rules }: $CreatePermissionSetData) {
    await this.assertNameIsFree(name);
    return this.permissionSetModel.create({
      data: { name, rules }
    });
  }

  /** Every holder's `permissionSetId` is cleared by the relation's `onDelete: SetNull`. */
  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    await this.findById(id, { ability });
    return this.permissionSetModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'PermissionSet')], id }
    });
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    const permissionSets = await this.permissionSetModel.findMany({
      include: INCLUDE_HOLDER_COUNT,
      orderBy: { name: 'asc' },
      where: accessibleQuery(ability, 'read', 'PermissionSet')
    });
    return permissionSets.map(withHolderCount);
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const permissionSet = await this.permissionSetModel.findFirst({
      include: INCLUDE_HOLDER_COUNT,
      where: { AND: [accessibleQuery(ability, 'read', 'PermissionSet')], id }
    });
    if (!permissionSet) {
      throw new NotFoundException(`Failed to find permission set with ID: ${id}`);
    }
    return withHolderCount(permissionSet);
  }

  async updateById(id: string, { name, rules }: $UpdatePermissionSetData, { ability }: EntityOperationOptions = {}) {
    const permissionSet = await this.findById(id, { ability });
    if (name !== undefined && name !== permissionSet.name) {
      await this.assertNameIsFree(name);
    }
    return this.permissionSetModel.update({
      // Composite list fields must be replaced via `set` in the MongoDB connector.
      data: { name, rules: rules ? { set: rules } : undefined },
      where: { AND: [accessibleQuery(ability, 'update', 'PermissionSet')], id }
    });
  }

  /** Unscoped on purpose: a name must be unique across every set, not only those the caller can read. */
  private async assertNameIsFree(name: string) {
    if (await this.permissionSetModel.exists({ name })) {
      throw new ConflictException(`Permission set with name '${name}' already exists!`);
    }
  }
}
