import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { GroupEmailTemplate } from '@opendatacapture/schemas/group';
import type { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
    //
    // Both fields need the `isSet` fallback: `InstrumentsService.create` writes neither, so on an
    // instrument that was never imported from a repository the key is absent rather than null, and
    // Prisma's `null` filter does not match an absent key.
    const nonRepoInstruments = await this.instrumentModel.findMany({
      where: {
        AND: [
          { OR: [{ seriesGroupId: null }, { seriesGroupId: { isSet: false } }] },
          { OR: [{ sourceRepoId: null }, { sourceRepoId: { isSet: false } }] }
        ]
      }
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
    {
      accessibleInstrumentIds,
      emailTemplates,
      expectedUpdatedAt,
      instrumentRepoIds,
      settings,
      ...data
    }: UpdateGroupDto,
    { ability }: EntityOperationOptions = {}
  ) {
    const where: Prisma.GroupWhereInput = { AND: [accessibleQuery(ability, 'update', 'Group')], id };
    const group = await this.groupModel.findFirst({ where });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    }
    if (expectedUpdatedAt && group.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
      throw new ConflictException(`Group with ID '${id}' has been modified since it was loaded`);
    }
    // The check above is only a fast, friendly rejection — it is a separate read, so two writers
    // can both pass it. `expectedUpdatedAt` therefore also goes in the update's own `where`, which
    // is what actually makes the write conditional.
    const revisionGuard: { updatedAt?: Date } = expectedUpdatedAt ? { updatedAt: expectedUpdatedAt } : {};
    // Only guard against a genuine rename collision: check the requested name (not the current one,
    // which would always match this same group) and skip the check when the name is unchanged.
    const exists =
      typeof data.name === 'string' && data.name !== group.name && (await this.groupModel.exists({ name: data.name }));
    if (exists) {
      throw new ConflictException(`Group with name '${data.name}' already exists!`);
    }
    this.validateEmailTemplates(emailTemplates, data.activeAssignmentEmailTemplateId, group);

    // Guard against stale client state: an instrument may have been deleted since the client loaded the
    // group (the deleted id can linger in the client's accessible list). Connecting a non-existent
    // instrument makes Prisma fail the relation update, so restrict the set to ids that still exist.
    let validInstrumentIds: string[] | undefined;
    if (accessibleInstrumentIds) {
      const existingInstruments = await this.instrumentModel.findMany({
        select: { id: true },
        where: {
          id: { in: accessibleInstrumentIds },
          OR: [{ seriesGroupId: null }, { seriesGroupId: { isSet: false } }, { seriesGroupId: id }]
        }
      });
      validInstrumentIds = existingInstruments.map(({ id }) => id);
    }

    try {
      return await this.groupModel.update({
        data: {
          accessibleInstruments: validInstrumentIds
            ? {
                set: validInstrumentIds.map((id) => ({ id }))
              }
            : undefined,
          // Composite list fields must be replaced via `set` in the MongoDB connector.
          emailTemplates: emailTemplates ? { set: emailTemplates } : undefined,
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
        where: { AND: [accessibleQuery(ability, 'update', 'Group')], id, ...revisionGuard }
      });
    } catch (err) {
      // P2025 is "no record matched the where clause". The findFirst above already matched on id
      // and ability, so the revision guard is the only filter that can have started failing —
      // i.e. a concurrent edit. Anything else is a real fault and has to surface.
      if (revisionGuard.updatedAt && err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new ConflictException(`Group with ID '${id}' has been modified since it was loaded`);
      }
      throw err;
    }
  }

  /**
   * Reject a template list that cannot be resolved later. A duplicate id makes `find()` shadow
   * every match after the first, and an active id pointing at nothing makes the assignment
   * controller fall back to the built-in wording — so participants silently receive the wrong
   * message with nothing logged.
   */
  private validateEmailTemplates(
    emailTemplates: GroupEmailTemplate[] | undefined,
    activeId: null | string | undefined,
    group: { activeAssignmentEmailTemplateId?: null | string; emailTemplates?: GroupEmailTemplate[] }
  ): void {
    const templates = emailTemplates ?? group.emailTemplates ?? [];
    if (emailTemplates) {
      const ids = emailTemplates.map((template) => template.id);
      if (new Set(ids).size !== ids.length) {
        throw new BadRequestException('Each email template must have a unique id');
      }
    }
    // `undefined` leaves the stored value alone; `null` deliberately selects the built-in default.
    const nextActiveId = activeId === undefined ? group.activeAssignmentEmailTemplateId : activeId;
    if (nextActiveId && !templates.some((template) => template.id === nextActiveId)) {
      throw new BadRequestException(`No email template with id '${nextActiveId}' exists in this group`);
    }
  }
}
