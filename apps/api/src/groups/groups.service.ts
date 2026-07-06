import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { accessibleQuery } from '@/auth/ability.utils';
import type { EntityOperationOptions } from '@/core/types';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<'Group'>,
    @InjectModel('Instrument') private readonly instrumentModel: Model<'Instrument'>
  ) {}

  async create({ name, settings, type, ...data }: CreateGroupDto) {
    const exists = await this.groupModel.exists({ name });
    if (exists) {
      throw new ConflictException(`Group with name '${name}' already exists!`);
    }
    // Connect only instruments that did not come from an instrument repository. Repo-sourced
    // instruments are opt-in: a group manager must select them manually after a repo is assigned.
    const nonRepoInstruments = await this.instrumentModel.findMany({
      where: { sourceRepoId: null }
    });
    return this.groupModel.create({
      data: {
        accessibleInstruments: {
          connect: nonRepoInstruments.map(({ id }) => ({ id }))
        },
        name,
        settings: {
          defaultIdentificationMethod: type === 'CLINICAL' ? 'PERSONAL_INFO' : 'CUSTOM_ID',
          ...settings
        },
        type,
        ...data
      }
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    return this.groupModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'Group')], id }
    });
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    return this.groupModel.findMany({
      where: accessibleQuery(ability, 'read', 'Group')
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Group')], id }
    });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    }
    return group;
  }

  async updateById(
    id: string,
    { accessibleInstrumentIds, instrumentRepoIds, settings, ...data }: UpdateGroupDto,
    { ability }: EntityOperationOptions = {}
  ) {
    const where: Prisma.GroupWhereInput = { AND: [accessibleQuery(ability, 'update', 'Group')], id };
    const group = await this.groupModel.findFirst({ where });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    }
    // Only guard against a genuine rename collision: check the requested name (not the current one,
    // which would always match this same group) and skip the check when the name is unchanged.
    const exists =
      typeof data.name === 'string' && data.name !== group.name && (await this.groupModel.exists({ name: data.name }));
    if (exists) {
      throw new ConflictException(`Group with name '${data.name}' already exists!`);
    }

    // Guard against stale client state: an instrument may have been deleted since the client loaded the
    // group (the deleted id can linger in the client's accessible list). Connecting a non-existent
    // instrument makes Prisma fail the relation update, so restrict the set to ids that still exist.
    let validInstrumentIds: string[] | undefined;
    if (accessibleInstrumentIds) {
      const existingInstruments = await this.instrumentModel.findMany({
        select: { id: true },
        where: { id: { in: accessibleInstrumentIds } }
      });
      validInstrumentIds = existingInstruments.map(({ id }) => id);
    }

    return this.groupModel.update({
      data: {
        accessibleInstruments: validInstrumentIds
          ? {
              set: validInstrumentIds.map((id) => ({ id }))
            }
          : undefined,
        instrumentRepos: instrumentRepoIds
          ? {
              set: instrumentRepoIds.map((id) => ({ id }))
            }
          : undefined,
        settings: {
          ...group.settings,
          ...settings
        },
        ...data
      },
      where: { AND: [accessibleQuery(ability, 'update', 'Group')], id }
    });
  }
}
