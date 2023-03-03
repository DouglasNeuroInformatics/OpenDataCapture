import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { DateUtils } from 'common';

import { FormInstrumentDto } from './dto/form-instrument.dto';
import { InstrumentRecordDto, InstrumentRecordExportDto } from './dto/instrument-record.dto';
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

  async getAvailableInstrumentRecords(subjectIdentifier: string): Promise<any> {
    const subject = await this.subjectsService.findByIdentifier(subjectIdentifier);
    const records = await this.instrumentRecordsRepository.find({ subject }, 'instrument', ['instrument']);
    const summary: Record<string, { count: number }> = {};
    for (let i = 0; i < records.length; i++) {
      const title = records[i].instrument.title;
      if (!Object.keys(summary).includes(title)) {
        summary[title] = { count: 0 };
      }
      summary[title].count++;
    }
    return Object.entries(summary).map(([title, info]) => ({ title, ...info }));
  }

  async exportRecords(): Promise<InstrumentRecordExportDto[]> {
    const subjects = await this.subjectsService.findAll();
    const data: InstrumentRecordExportDto[] = [];
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      const records = await this.instrumentRecordsRepository.find({ subject }, undefined, ['instrument']);
      for (let j = 0; j < records.length; j++) {
        const record = records[j];
        for (const measure of Object.keys(record.data)) {
          data.push({
            subjectId: subject.identifier,
            subjectAge: DateUtils.yearsPassed(subject.demographics.dateOfBirth),
            subjectSex: subject.demographics.sex,
            instrument: record.instrument.title,
            measure: measure,
            value: record.data[measure] as string
          });
        }
      }
    }
    return data;
  }

  async exportRecordsAsCSV(): Promise<string> {
    const exportRecords = await this.exportRecords();
    const columnNames = Object.keys(exportRecords[0]);
    const rows = exportRecords.map((record) => Object.values(record).join(',')).join('\n');
    return columnNames + '\n' + rows;
  }

  async getRecords(instrumentTitle?: string, subjectIdentifier?: string): Promise<InstrumentRecord[]> {
    const subjectQuery = subjectIdentifier
      ? {
          subject: await this.subjectsService.findByIdentifier(subjectIdentifier)
        }
      : {};
    const instrumentQuery = instrumentTitle
      ? {
          instrument: await this.getInstrument(instrumentTitle)
        }
      : {};
    console.log({ instrumentTitle, subjectIdentifier });
    return this.instrumentRecordsRepository.find({ ...instrumentQuery, ...subjectQuery });
  }
}
