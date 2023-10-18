import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Subject } from '@open-data-capture/types';
import unidecode from 'unidecode';

import { AbilityService } from '@/ability/ability.service';

import { SubjectIdentificationDataDto } from './dto/subject-identification-data.dto';
import { SubjectsRepository } from './subjects.repository';

import type { UpdateSubjectDto } from './dto/update-subject.dto';

/**
 * Please note that although the SubjectsService implements EntityService, the `id` methods
 * get the subject by the custom identifier rather than the default ObjectId
 */
@Injectable()
export class SubjectsService implements EntityService<Partial<Subject>> {
  constructor(
    private readonly abilityService: AbilityService,
    private readonly cryptoService: CryptoService,
    private readonly subjectsRepository: SubjectsRepository
  ) {}

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

  async deleteById(identifier: string, { validateAbility = true } = {}) {
    const subject = await this.subjectsRepository.findOne({ identifier });
    if (!subject) {
      throw new NotFoundException(`Failed to find subject with identifier: ${identifier}`);
    } else if (validateAbility && !this.abilityService.can('delete', subject)) {
      throw new ForbiddenException(`Insufficient rights to delete subject with identifier: ${identifier}`);
    }
    return (await this.subjectsRepository.deleteOne({ identifier }))!;
  }

  async findAll({ validateAbility = true } = {}) {
    if (!validateAbility) {
      return this.subjectsRepository.find();
    }
    return this.subjectsRepository.find(this.abilityService.accessibleQuery('read'));
  }

  async findByGroup(groupName: string, { validateAbility = true } = {}) {
    const groupQuery = { groups: { name: groupName } };
    if (!validateAbility) {
      return this.subjectsRepository.find(groupQuery);
    }
    return this.subjectsRepository.find(this.abilityService.accessibleQuery('read', groupQuery));
  }

  async findById(identifier: string, { validateAbility = true } = {}) {
    const subject = await this.subjectsRepository.findById(identifier);
    if (!subject) {
      throw new NotFoundException(`Failed to find subject with identifier: ${identifier}`);
    } else if (validateAbility && !this.abilityService.can('delete', subject)) {
      throw new ForbiddenException(`Insufficient rights to read subject with identifier: ${identifier}`);
    }
    return subject;
  }

  async findByLookup(data: SubjectIdentificationDataDto) {
    return this.findById(this.generateIdentifier(data));
  }

  async updateById(identifier: string, update: UpdateSubjectDto, { validateAbility = true } = {}) {
    const subject = await this.subjectsRepository.findById(identifier);
    if (!subject) {
      throw new NotFoundException(`Failed to find subject with ID: ${identifier}`);
    } else if (validateAbility && !this.abilityService.can('update', subject)) {
      throw new ForbiddenException(`Insufficient rights to update subject with ID: ${identifier}`);
    }
    return (await this.subjectsRepository.updateOne({ identifier }, update))!;
  }

  private generateIdentifier({ dateOfBirth, firstName, lastName, sex }: SubjectIdentificationDataDto): string {
    const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
    const info = firstName + lastName + shortDateOfBirth + sex;
    const source = unidecode(info.toUpperCase().replaceAll('-', ''));
    return this.cryptoService.hash(source);
  }
}
