import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { TranslatedForms } from '@ddcp/instruments';
import type { FormInstrument, FormInstrumentSummary, Language } from '@ddcp/types';
import { FormFields, FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { Model, ObjectId } from 'mongoose';

import { FormInstrumentEntity } from '../entities/form-instrument.entity.js';
import { InstrumentEntity } from '../entities/instrument.entity.js';

import { CryptoService } from '@/crypto/crypto.service.js';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(InstrumentEntity.modelName)
    private readonly formModel: Model<FormInstrumentEntity, AccessibleModel<FormInstrumentEntity>>,
    private readonly cryptoService: CryptoService
  ) {}

  async create<T extends FormInstrumentData>(formInstrument: FormInstrument<T>): Promise<FormInstrument> {
    const identifier = this.createIdentifier(formInstrument.name, formInstrument.version);
    const conflict = await this.formModel.exists({
      identifier,
      'details.language': formInstrument.details.language
    });
    if (conflict) {
      throw new ConflictException('Instrument already exists');
    }
    return this.formModel.create({
      identifier: this.createIdentifier(formInstrument.name, formInstrument.version),
      ...formInstrument
    });
  }

  async createTranslatedForms<T extends FormInstrumentData>(
    translatedForms: TranslatedForms<T>
  ): Promise<FormInstrument[]> {
    return Promise.all(Object.values(translatedForms).map(async (form) => await this.create(form)));
  }

  findAll(): Promise<FormInstrumentEntity[]> {
    return this.formModel.find({ kind: 'form' });
  }

  async getAvailable(): Promise<FormInstrumentSummary[]> {
    return this.formModel.find({ kind: 'form' }).select('identifier name tags version details').lean();
  }

  async findByIdentifier(identifier: string): Promise<FormInstrumentEntity[]> {
    return this.formModel.find({ identifier });
  }

  async findOne(identifier: string, language?: Language): Promise<FormInstrumentEntity> {
    const result = await this.formModel.findOne({ identifier, 'details.language': language });
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with identifier: ${identifier}`);
    }
    return result;
  }

  /** @deprecated */
  async findById(id: string | ObjectId): Promise<FormInstrumentEntity> {
    const result = await this.formModel.findById(id);
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with id: ${id.toString()}`);
    }
    return result;
  }

  async findByName(name: string): Promise<FormInstrumentEntity> {
    const result = await this.formModel.findOne({ name });
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with name: ${name}`);
    }
    return result;
  }

  async remove(id: string): Promise<FormInstrumentEntity> {
    const result = await this.formModel.findByIdAndDelete(id, { new: true });
    if (!result) {
      throw new NotFoundException(`Failed to find form with id: ${id}`);
    }
    return result;
  }

  getFields<T extends FormInstrumentData>(instrument: FormInstrument<T>): FormFields<T> {
    let fields: FormFields<T>;
    if (Array.isArray(instrument.content)) {
      fields = instrument.content.reduce(
        (prev, current) => ({ ...prev, ...current.fields }),
        instrument.content[0].fields
      ) as FormFields<T>;
    } else {
      fields = instrument.content;
    }
    return fields;
  }

  private createIdentifier(name: string, version: number): string {
    return this.cryptoService.hash(name + version);
  }
}
