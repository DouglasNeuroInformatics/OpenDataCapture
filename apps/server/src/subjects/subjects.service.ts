import { ConflictException, Injectable } from '@nestjs/common';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { Sex } from './enums/sex.enum';
import { Subject } from './entities/subject.entity';
import { SubjectsRepository } from './subjects.repository';

import { CryptoService } from '@/crypto/crypto.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly cryptoService: CryptoService, private readonly subjectsRepository: SubjectsRepository) {}

  async create({ firstName, lastName, dateOfBirth, sex }: CreateSubjectDto): Promise<Subject> {
    const identifier = this.generateIdentifier(firstName, lastName, new Date(dateOfBirth), sex);
    if (await this.subjectsRepository.exists({ identifier })) {
      throw new ConflictException('A subject with the provided demographic information already exists');
    }
    return this.subjectsRepository.create({ identifier, firstName, lastName, dateOfBirth: new Date(dateOfBirth), sex });
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectsRepository.find();
  }

  generateIdentifier(firstName: string, lastName: string, dateOfBirth: Date, sex: Sex): string {
    const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
    const source = this.sanitizeStr(firstName + lastName) + this.sanitizeStr(shortDateOfBirth, true) + sex;
    return this.cryptoService.hash(source);
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
