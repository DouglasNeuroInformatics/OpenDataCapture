import { accessibleBy } from '@casl/mongoose';
import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { EntityController } from '@douglasneuroinformatics/nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common/exceptions';
import type { FormInstrument, FormInstrumentSummary, InstrumentLanguage } from '@open-data-capture/types';
import type { FilterQuery } from 'mongoose';

import type { EntityOperationOptions } from '@/core/types';

import { InstrumentsRepository } from './instruments.repository';

@Injectable()
export class FormsService implements EntityController<FormInstrument> {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  async count(filter: FilterQuery<FormInstrument> = {}, { ability }: EntityOperationOptions = {}) {
    return this.instrumentsRepository.count({
      $and: [{ kind: 'form' }, filter, ability ? accessibleBy(ability, 'read').Instrument : {}]
    });
  }

  async create<TData extends FormDataType, TLanguage extends InstrumentLanguage>(
    form: FormInstrument<TData, TLanguage>
  ) {
    if (await this.instrumentsRepository.exists({ name: form.name })) {
      throw new ConflictException(`Instrument with name '${form.name}' already exists!`);
    }
    return this.instrumentsRepository.create<FormInstrument<TData, TLanguage>>(form);
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const form = await this.instrumentsRepository.findById(id);
    if (!form) {
      throw new NotFoundException(`Failed to find form with ID: ${id}`);
    } else if (form.kind !== 'form') {
      throw new NotFoundException(`Instrument with ID '${id}' exists, but is not a form`);
    } else if (ability && !ability.can('delete', form)) {
      throw new ForbiddenException(`Insufficient rights to delete form with ID: ${id}`);
    }
    return (await this.instrumentsRepository.deleteById<FormInstrument>(id))!;
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    if (!ability) {
      return this.instrumentsRepository.find<FormInstrument>({ kind: 'form' });
    }
    return this.instrumentsRepository.find<FormInstrument>({
      $and: [{ kind: 'form' }, accessibleBy(ability, 'read').Instrument]
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const form = await this.instrumentsRepository.findById<FormInstrument>(id);
    if (!form) {
      throw new NotFoundException(`Failed to find from with ID: ${id}`);
    } else if (form.kind !== 'form') {
      throw new NotFoundException(`Instrument with ID '${id}' exists, but is not a form`);
    } else if (ability && !ability.can('delete', form)) {
      throw new ForbiddenException(`Insufficient rights to read form with ID: ${id}`);
    }
    return form;
  }

  async getSummary(): Promise<FormInstrumentSummary[]> {
    return this.instrumentsRepository.find<FormInstrument>(
      { kind: 'form' },
      {
        projection: {
          details: true,
          kind: true,
          language: true,
          name: true,
          tags: true,
          version: true
        }
      }
    );
  }

  async updateById(id: string, update: Partial<FormInstrument>, { ability }: EntityOperationOptions = {}) {
    const form = await this.instrumentsRepository.findById(id);
    if (!form) {
      throw new NotFoundException(`Failed to find form with ID: ${id}`);
    } else if (form.kind !== 'form') {
      throw new NotFoundException(`Instrument with ID '${id}' exists, but is not a form`);
    } else if (ability && !ability.can('update', form)) {
      throw new ForbiddenException(`Insufficient rights to update form with ID: ${id}`);
    }
    return (await this.instrumentsRepository.updateById(id, update))!;
  }
}
