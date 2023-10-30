import { accessibleBy } from '@casl/mongoose';
import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Subject } from '@open-data-capture/common/subject';
import type { FilterQuery } from 'mongoose';
import unidecode from 'unidecode';

import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';

import { SubjectIdentificationDataDto } from './dto/subject-identification-data.dto';
import { SubjectsRepository } from './subjects.repository';

/**
 * Please note that although the SubjectsService implements EntityService, the `id` methods
 * get the subject by the custom identifier rather than the default ObjectId
 */
@Injectable()
export class SubjectsService implements Omit<EntityService<Partial<Subject>>, 'updateById'> {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService,
    private readonly subjectsRepository: SubjectsRepository
  ) {}

  async count(filter: FilterQuery<Subject> = {}, { ability }: EntityOperationOptions = {}) {
    return this.subjectsRepository.count({ $and: [filter, ability ? accessibleBy(ability, 'read').Subject : {}] });
  }

  async create(data: SubjectIdentificationDataDto) {
    const identifier = this.generateIdentifier({ ...data });
    if (await this.subjectsRepository.exists({ identifier })) {
      throw new ConflictException('A subject with the provided demographic information already exists');
    }
    return this.subjectsRepository.create({
      groups: [],
      identifier,
      ...data
    });
  }

  async deleteById(identifier: string, { ability }: EntityOperationOptions = {}) {
    const subject = await this.subjectsRepository.findOne({ identifier });
    if (!subject) {
      throw new NotFoundException(`Failed to find subject with identifier: ${identifier}`);
    } else if (ability && !ability.can('delete', subject)) {
      throw new ForbiddenException(`Insufficient rights to delete subject with identifier: ${identifier}`);
    }
    return (await this.subjectsRepository.deleteOne({ identifier }))!;
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    if (!ability) {
      return this.subjectsRepository.find();
    }
    return this.subjectsRepository.find(accessibleBy(ability, 'read').Subject);
  }

  async findByGroup(groupName: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupsService.findByName(groupName);
    return this.subjectsRepository.find({
      $and: [{ groups: group }, ability ? accessibleBy(ability, 'read').Subject : {}]
    });
  }

  async findById(identifier: string, { ability }: EntityOperationOptions = {}) {
    const subject = await this.subjectsRepository.findOne({ identifier });
    if (!subject) {
      throw new NotFoundException(`Failed to find subject with identifier: ${identifier}`);
    } else if (ability && !ability.can('delete', subject)) {
      throw new ForbiddenException(`Insufficient rights to read subject with identifier: ${identifier}`);
    }
    return subject;
  }

  async findByLookup(data: SubjectIdentificationDataDto, options?: EntityOperationOptions) {
    return this.findById(this.generateIdentifier(data), options);
  }

  private generateIdentifier({ dateOfBirth, firstName, lastName, sex }: SubjectIdentificationDataDto): string {
    const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
    const info = firstName + lastName + shortDateOfBirth + sex;
    const source = unidecode(info.toUpperCase().replaceAll('-', ''));
    return this.cryptoService.hash(source);
  }
}
