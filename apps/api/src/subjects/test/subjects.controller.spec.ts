/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import { Test, TestingModule } from '@nestjs/testing';

import { SubjectsController } from '../subjects.controller.js';
import { SubjectsService } from '../subjects.service.js';

const mockSubject = Object.freeze({ firstName: 'John', lastName: 'Smith', sex: 'male', dateOfBirth: '2000-01-01' });

describe('SubjectsController', () => {
  let subjectsController: SubjectsController;
  let subjectsService: SubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        {
          provide: SubjectsService,
          useValue: {}
        }
      ]
    }).compile();

    subjectsController = module.get(SubjectsController);
    subjectsService = module.get(SubjectsService);
  });

  it('should be defined', () => {
    assert(subjectsController);
  });

  describe('create', () => {
    it('should call subjectsService.create with the same argument', () => {
      subjectsService.create = mock.fn();
      assert.strictEqual((subjectsService.create as any).mock.calls.length, 0);
      subjectsController.create(mockSubject);
      const call = (subjectsService.create as any).mock.calls[0];
      assert.deepEqual(call.arguments[0], mockSubject);
    });
  });
});
