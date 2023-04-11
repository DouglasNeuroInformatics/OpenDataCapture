import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { AppAbility, Group, Sex } from '@ddcp/common';
import unidecode from 'unidecode';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { LookupSubjectDto } from './dto/lookup-subject.dto';
import { SubjectEntity } from './entities/subject.entity';
import { SubjectsRepository } from './subjects.repository';

import { CryptoService } from '@/crypto/crypto.service';
import { GroupsService } from '@/groups/groups.service';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService,
    private readonly subjectsRepository: SubjectsRepository
  ) {}

  async create({ firstName, lastName, dateOfBirth, sex }: CreateSubjectDto): Promise<SubjectEntity> {
    const identifier = this.generateIdentifier(firstName, lastName, new Date(dateOfBirth), sex);
    if (await this.subjectsRepository.exists({ identifier })) {
      throw new ConflictException('A subject with the provided demographic information already exists');
    }
    return this.subjectsRepository.create({
      identifier,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      sex,
      groups: []
    });
  }

  async findAll(ability: AppAbility, groupName?: string): Promise<SubjectEntity[]> {
    const filter = groupName ? { groups: await this.groupsService.findByName(groupName, ability) } : {};
    return this.subjectsRepository.find(filter).accessibleBy(ability).lean();
  }

  async lookup(dto: LookupSubjectDto): Promise<SubjectEntity> {
    const { firstName, lastName, dateOfBirth, sex } = dto;
    const identifier = this.generateIdentifier(firstName, lastName, new Date(dateOfBirth), sex);
    const subject = await this.findByIdentifier(identifier);
    return subject;
  }

  /** Returns the subject with the provided identifier */
  async findByIdentifier(identifier: string): Promise<SubjectEntity> {
    const result = await this.subjectsRepository.findOne({ identifier }).lean();
    if (!result) {
      throw new NotFoundException(`Subject with identifier does not exist: ${identifier}`);
    }
    return result;
  }

  /** Append a group to the subject with the provided identifier */
  async appendGroup(identifier: string, group: Group): Promise<SubjectEntity> {
    const subject = await this.subjectsRepository.findOne({ identifier });
    if (!subject) {
      throw new NotFoundException(`Subject with identifier does not exist: ${identifier}`);
    }
    return subject.updateOne({ groups: [group, ...subject.groups] });
  }

  generateIdentifier(firstName: string, lastName: string, dateOfBirth: Date, sex: Sex): string {
    const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
    const source = this.sanitizeStr(firstName + lastName + shortDateOfBirth + sex);
    return this.cryptoService.hash(source);
  }

  private sanitizeStr(s: string): string {
    return unidecode(s.toUpperCase().replaceAll('-', ''));
  }
}
