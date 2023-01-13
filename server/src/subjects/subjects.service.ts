import { createHash } from 'crypto';

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { RegisterSubjectDto } from './dto/register-subject.dto';
import { Subject } from './schemas/subject.schema';
import { SubjectsRepository } from './subjects.repository';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepository: SubjectsRepository) {}

  async create(dto: RegisterSubjectDto): Promise<Subject> {
    const subjectId = this.generateSubjectId(dto.firstName, dto.lastName, dto.dateOfBirth);
    if (await this.subjectsRepository.exists({ _id: subjectId })) {
      throw new ConflictException('A subject with the provided demographic information already exists');
    }
    return this.subjectsRepository.create({ _id: subjectId, ...dto });
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectsRepository.findAll();
  }

  async findById(id: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findById(id);
    if (!subject) {
      throw new NotFoundException();
    }
    return subject;
  }

  /*



  async deleteById(id: string): Promise<void> {
    const deleted = await this.subjectsRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException();
    }
  }
  */
  
  generateSubjectId(firstName: string, lastName: string, dateOfBirth: Date): string {
    const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
    const source = this.sanitizeStr(firstName + lastName) + this.sanitizeStr(shortDateOfBirth, true);
    return createHash('sha256').update(source).digest('hex');
  }

  private sanitizeStr(s: string, allowNumericChars = false, validSpecialChars = /[-\s]/g): string {
    s = s
      .toUpperCase()
      .replace(validSpecialChars, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const invalidRegExp = allowNumericChars ? /[^A-Z0-9]/g : /[^A-Z]/g;
    const invalidChars = s.toUpperCase().match(invalidRegExp);
    if (invalidChars) {
      throw new Error(`The following characters are invalid: ${invalidChars.join(', ')}`);
    }
    return s;
  }
}
