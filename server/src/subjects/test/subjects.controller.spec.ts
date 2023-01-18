import { Test } from '@nestjs/testing';

import { createMock } from '@golevelup/ts-jest';

import { SubjectsController } from '../subjects.controller';
import { SubjectsService } from '../subjects.service';

import { mockRegisterSubjectDto } from './stubs/subjects.stubs';

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

  describe('register', () => {
    it('should call subjectsService.register', async () => {
      await subjectsController.register(mockRegisterSubjectDto);
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
