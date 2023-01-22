import { createHash } from 'crypto';

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { RegisterSubjectDto } from './dto/register-subject.dto';
import { Subject } from './schemas/subject.schema';
import { SubjectsRepository } from './subjects.repository';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepository: SubjectsRepository) {}

  async create(dto: RegisterSubjectDto): Promise<Subject> {
    const identifier = this.generateIdentifier(dto.firstName, dto.lastName, dto.dateOfBirth);
    if (await this.subjectsRepository.exists({ identifier })) {
      throw new ConflictException('A subject with the provided demographic information already exists');
    }
    return this.subjectsRepository.create({ identifier, demographics: dto });
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectsRepository.findAll();
  }

  async findByIdentifier(identifier: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({ identifier });
    if (!subject) {
      throw new NotFoundException(`Subject with identifier ${identifier} not found`);
    }
    return subject;
  }

  generateIdentifier(firstName: string, lastName: string, dateOfBirth: Date): string {
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
