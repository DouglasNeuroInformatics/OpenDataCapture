import { type AccessibleModel } from '@casl/mongoose';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { AppAbility, Group, Sex } from '@open-data-capture/types';
import { Model } from 'mongoose';
import unidecode from 'unidecode';

import { GroupsService } from '@/groups/groups.service';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { LookupSubjectDto } from './dto/lookup-subject.dto';
import { type SubjectDocument, SubjectEntity } from './entities/subject.entity';


@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(SubjectEntity.modelName)
    private readonly subjectModel: Model<SubjectDocument, AccessibleModel<SubjectDocument>>,
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService
  ) {}

  /** Append a group to the subject with the provided identifier */
  async appendGroup(identifier: string, group: Group): Promise<SubjectEntity> {
    const subject = await this.subjectModel.findOne({ identifier });
    if (!subject) {
      throw new NotFoundException(`Subject with identifier does not exist: ${identifier}`);
    }
    return subject.updateOne({ groups: [group, ...subject.groups] });
  }

  async create({ dateOfBirth, firstName, lastName, sex }: CreateSubjectDto): Promise<SubjectEntity> {
    const identifier = this.generateIdentifier(firstName, lastName, new Date(dateOfBirth), sex);
    if (await this.subjectModel.exists({ identifier })) {
      throw new ConflictException('A subject with the provided demographic information already exists');
    }
    return this.subjectModel.create({
      dateOfBirth: new Date(dateOfBirth),
      firstName,
      groups: [],
      identifier,
      lastName,
      sex
    });
  }

  async findAll(ability: AppAbility, groupName?: string): Promise<SubjectEntity[]> {
    const filter = groupName ? { groups: await this.groupsService.findByName(groupName, ability) } : {};
    return this.subjectModel.find(filter).accessibleBy(ability).lean();
  }

  /** Returns the subject with the provided identifier */
  async findByIdentifier(identifier: string): Promise<SubjectEntity> {
    const result = await this.subjectModel.findOne({ identifier }).lean();
    if (!result) {
      throw new NotFoundException(`Subject with identifier does not exist: ${identifier}`);
    }
    return result;
  }

  generateIdentifier(firstName: string, lastName: string, dateOfBirth: Date, sex: Sex): string {
    const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
    const info = firstName + lastName + shortDateOfBirth + sex;
    const source = unidecode(info.toUpperCase().replaceAll('-', ''));
    return this.cryptoService.hash(source);
  }

  async lookup(dto: LookupSubjectDto): Promise<SubjectEntity> {
    const { dateOfBirth, firstName, lastName, sex } = dto;
    const identifier = this.generateIdentifier(firstName, lastName, new Date(dateOfBirth), sex);
    const subject = await this.findByIdentifier(identifier);
    return subject;
  }
}
