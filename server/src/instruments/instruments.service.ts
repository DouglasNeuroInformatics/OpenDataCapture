import { Injectable, NotFoundException } from '@nestjs/common';

import { InstrumentRecordDto } from './dto/instrument-record.dto';
import { InstrumentDto } from './dto/instrument.dto';
import { InstrumentRecordsRepository } from './repositories/instrument-records.repository';
import { InstrumentsRepository } from './repositories/instruments.repository';
import { Instrument } from './schemas/instrument.schema';

import { SubjectsService } from '@/subjects/subjects.service';
import { InstrumentRecord } from './schemas/instrument-record.schema';
import mongoose from 'mongoose';

@Injectable()
export class InstrumentsService {
  constructor(
    private readonly instrumentsRepository: InstrumentsRepository,
    private readonly instrumentRecordsRepository: InstrumentRecordsRepository,
    private readonly subjectsService: SubjectsService
  ) {}

  create(dto: InstrumentDto): Promise<Instrument> {
    return this.instrumentsRepository.create(dto);
  }

  getAll(): Promise<Instrument[]> {
    return this.instrumentsRepository.findAll();
  }

  async getById(id: string): Promise<Instrument> {
    const instrument = await this.instrumentsRepository.findById(id);
    if (!instrument) {
      throw new NotFoundException(`Instrument with ID ${id} not found`);
    }
    return instrument;
  }

  async insertRecord(id: string, dto: InstrumentRecordDto): Promise<InstrumentRecord> {
    const { firstName, lastName, dateOfBirth } = dto.subjectDemographics;
    const subjectId = this.subjectsService.generateSubjectId(firstName, lastName, dateOfBirth);

    return this.instrumentRecordsRepository.create({
      instrument: await this.instrumentsRepository.findById(id),
      subjectId: await this.subjectsService.findById(subjectId),
      responses: dto.responses
    });
  }

  // Fix after demo
  async getRecords(instrumentId?: string, subjectId?: string): Promise<InstrumentRecord[]> {
    let records = await this.instrumentRecordsRepository.find({});

    if (instrumentId) {
      records = records.filter(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        (record) => record.instrument._id.toString() === instrumentId
      );
    }

    if (subjectId) {
      records = records.filter(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        (record) => record.subjectId === subjectId
      );
    }

    return records;
  }
}
