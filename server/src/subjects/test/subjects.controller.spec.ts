import { Test } from '@nestjs/testing';

import { createMock } from '@golevelup/ts-jest';

import { SubjectsController } from '../subjects.controller';
import { SubjectsService } from '../subjects.service';

import { mockCreateSubjectDto } from './stubs/subjects.stubs';

describe('SubjectsController', () => {
  let subjectsController: SubjectsController;
  let subjectsService: SubjectsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        {
          provide: SubjectsService,
          useValue: createMock<SubjectsService>()
        }
      ]
    }).compile();

    subjectsController = moduleRef.get(SubjectsController);
    subjectsService = moduleRef.get(SubjectsService);
  });

  describe('create', () => {
    it('should call subjectsService.create', async () => {
      await subjectsController.create(mockCreateSubjectDto);
      expect(subjectsService.create).toBeCalled();
    });
  });

  describe('findAll', () => {
    it('should call subjectsService.findAll', async () => {
      await subjectsController.findAll();
      expect(subjectsService.findAll).toBeCalled();
    });
  });
});
