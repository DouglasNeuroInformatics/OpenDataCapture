/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { type AccessibleModel } from '@casl/mongoose';
import type { FormFields, FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { TranslatedForms } from '@open-data-capture/instruments';
import type { FormInstrument, FormInstrumentSummary, Language } from '@open-data-capture/types';
import { Model } from 'mongoose';

import { FormInstrumentEntity } from '../entities/form-instrument.entity';
import { InstrumentEntity } from '../entities/instrument.entity';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(InstrumentEntity.modelName)
    private readonly formModel: Model<FormInstrumentEntity, AccessibleModel<FormInstrumentEntity>>,
    private readonly cryptoService: CryptoService
  ) {}

  private createIdentifier(name: string, version: number): string {
    return this.cryptoService.hash(name + version);
  }

  async create<T extends FormInstrumentData>(formInstrument: FormInstrument<T>): Promise<FormInstrument> {
    const identifier = this.createIdentifier(formInstrument.name, formInstrument.version);
    const conflict = await this.formModel.exists({
      'details.language': formInstrument.details.language,
      identifier
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

  async findByIdentifier(identifier: string): Promise<FormInstrumentEntity[]> {
    return this.formModel.find({ identifier });
  }

  async findByName(name: string): Promise<FormInstrumentEntity> {
    const result = await this.formModel.findOne({ name });
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with name: ${name}`);
    }
    return result;
  }

  async findOne(identifier: string, language?: Language): Promise<FormInstrumentEntity> {
    const result = await this.formModel.findOne({ 'details.language': language, identifier });
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with identifier: ${identifier}`);
    }
    return result;
  }

  async getAvailable(): Promise<FormInstrumentSummary[]> {
    return this.formModel.find({ kind: 'form' }).select('identifier name tags version details').lean();
  }

  getFields<T extends FormInstrumentData>(instrument: FormInstrument<T>): FormFields<T> {
    let fields: FormFields<T>;
    if (Array.isArray(instrument.content)) {
      fields = instrument.content.reduce(
        (prev: any, current: { fields: any }) => ({ ...prev, ...current.fields }),
        instrument.content[0]?.fields
      ) as FormFields<T>;
    } else {
      fields = instrument.content;
    }
    return fields;
  }

  async remove(id: string): Promise<FormInstrumentEntity> {
    const result = await this.formModel.findByIdAndDelete(id, { new: true });
    if (!result) {
      throw new NotFoundException(`Failed to find form with id: ${id}`);
    }
    return result;
  }
}
