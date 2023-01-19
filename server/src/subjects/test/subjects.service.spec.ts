import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { SubjectsRepository } from '../subjects.repository';
import { SubjectsService } from '../subjects.service';

import { mockRegisterSubjectDto } from './stubs/subjects.stubs';

const MockSubjectsRepository = createMock<SubjectsRepository>({
  exists: () => Promise.resolve(false)
});

describe('SubjectsService', () => {
  let subjectsService: SubjectsService;
  let subjectsRepository: SubjectsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: SubjectsRepository,
          useValue: MockSubjectsRepository
        }
      ]
    }).compile();
    subjectsService = moduleRef.get(SubjectsService);
    subjectsRepository = moduleRef.get(SubjectsRepository);
  });

  describe('create', () => {
    it('should call subjectsRepository with the expected ID', async () => {
      await subjectsService.create(mockRegisterSubjectDto);
      expect(subjectsRepository.create).toBeCalledWith({
        identifier: '565125d8a77334ab8ddd9be95308a67885f5230fda8dd5755c6d9f1490225075',
        ...mockRegisterSubjectDto
      });
    });
  });
});
