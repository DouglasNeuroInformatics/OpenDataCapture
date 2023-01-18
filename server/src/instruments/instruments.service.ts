import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { FormInstrumentDto } from './dto/form-instrument.dto';
import { InstrumentRecordDto } from './dto/instrument-record.dto';
import { InstrumentRecordsRepository } from './repositories/instrument-records.repository';

import { SubjectsService } from '@/subjects/subjects.service';

import { InstrumentsRepository } from './repositories/instruments.repository';
import { InstrumentRecord } from './schemas/instrument-record.schema';
import { Instrument } from './schemas/instrument.schema';

@Injectable()
export class InstrumentsService {
  constructor(
    private readonly instrumentsRepository: InstrumentsRepository,
    private readonly instrumentRecordsRepository: InstrumentRecordsRepository,
    private readonly subjectsService: SubjectsService
  ) {}

  async createForm(dto: FormInstrumentDto): Promise<Instrument> {
    if (await this.instrumentsRepository.exists({ title: dto.title })) {
      throw new ConflictException(`An instrument entitled '${dto.title}' already exists`);
    }
    return this.instrumentsRepository.create(dto);
  }

  // Should subset data with select
  async getAvailableInstruments(): Promise<Omit<Instrument, 'data'>[]> {
    return await this.instrumentsRepository.findAll();
  }

  async getInstrument(title: string): Promise<Instrument> {
    const instrument = await this.instrumentsRepository.findOne({ title });
    if (!instrument) {
      throw new NotFoundException(`Failed to find an instrument entitled ${title}`);
    }
    return instrument;
  }

  async createRecord(title: string, dto: InstrumentRecordDto): Promise<InstrumentRecord> {
    const { firstName, lastName, dateOfBirth } = dto.subjectDemographics;
    const subjectId = this.subjectsService.generateSubjectId(firstName, lastName, dateOfBirth);

    const instrument = await this.instrumentsRepository.findOne({ title });
    const subject = await this.subjectsService.findById(subjectId);

    return this.instrumentRecordsRepository.create({
      dateCollected: dto.dateCollected || new Date(),
      instrument,
      subject,
      data: dto.data
    });
  }

  async getRecords(instrumentTitle?: string, subjectId?: string): Promise<InstrumentRecord[]> {
    return this.instrumentRecordsRepository.find({ title: instrumentTitle || {}, subject: subjectId });
  }
}
