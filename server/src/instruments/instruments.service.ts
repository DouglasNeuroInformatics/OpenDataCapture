import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { FormInstrumentDto } from './dto/form-instrument.dto';
import { InstrumentRecordDto } from './dto/instrument-record.dto';
import { InstrumentRecordsRepository } from './repositories/instrument-records.repository';
import { InstrumentsRepository } from './repositories/instruments.repository';
import { InstrumentRecord } from './schemas/instrument-record.schema';
import { Instrument } from './schemas/instrument.schema';

import { SubjectsService } from '@/subjects/subjects.service';

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
    const subjectIdentifier = this.subjectsService.generateIdentifier(firstName, lastName, dateOfBirth);

    const instrument = await this.instrumentsRepository.findOne({ title });
    if (!instrument) {
      throw new NotFoundException('Cannot create record for instrument that does not exist!');
    }

    const subject = await this.subjectsService.findByIdentifier(subjectIdentifier);

    return this.instrumentRecordsRepository.create({
      dateCollected: dto.dateCollected || new Date(),
      instrument,
      subject,
      data: Object.fromEntries(Object.entries(dto.data).map(([key, value]) => [key, parseInt(value as string)]))
    });
  }

  async getRecords(instrumentTitle?: string, subjectIdentifier?: string): Promise<InstrumentRecord[]> {
    return this.instrumentRecordsRepository.find({ title: instrumentTitle || {}, subject: subjectIdentifier });
  }
}
