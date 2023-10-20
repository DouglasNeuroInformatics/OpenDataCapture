import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { EntityController } from '@douglasneuroinformatics/nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common/exceptions';
import type { FormInstrument, InstrumentLanguage } from '@open-data-capture/types';

import { AbilityService } from '@/ability/ability.service';

import { InstrumentsRepository } from './instruments.repository';

@Injectable()
export class FormsService implements EntityController<FormInstrument> {
  constructor(
    private readonly abilityService: AbilityService,
    private readonly instrumentsRepository: InstrumentsRepository
  ) {}

  async create<TData extends FormDataType, TLanguage extends InstrumentLanguage>(
    form: FormInstrument<TData, TLanguage>
  ) {
    if (await this.instrumentsRepository.exists({ name: form.name })) {
      throw new ConflictException(`Instrument with name '${form.name}' already exists!`);
    }
    return this.instrumentsRepository.create<FormInstrument<TData, TLanguage>>(form);
  }

  async deleteById(id: string) {
    const form = await this.instrumentsRepository.findById(id);
    if (!form) {
      throw new NotFoundException(`Failed to find form with ID: ${id}`);
    } else if (!this.abilityService.can('delete', form)) {
      throw new ForbiddenException(`Insufficient rights to delete form with ID: ${id}`);
    }
    return (await this.instrumentsRepository.deleteById<FormInstrument>(id))!;
  }

  async findAll() {
    return this.instrumentsRepository.find<FormInstrument>(this.abilityService.accessibleQuery('read'));
  }

  async findById(id: string) {
    const form = await this.instrumentsRepository.findById<FormInstrument>(id);
    if (!form) {
      throw new NotFoundException(`Failed to find from with ID: ${id}`);
    } else if (!this.abilityService.can('delete', form)) {
      throw new ForbiddenException(`Insufficient rights to read form with ID: ${id}`);
    }
    return form;
  }

  async updateById(id: string, update: Partial<FormInstrument>) {
    const form = await this.instrumentsRepository.findById(id);
    if (!form) {
      throw new NotFoundException(`Failed to find form with ID: ${id}`);
    } else if (!this.abilityService.can('update', form)) {
      throw new ForbiddenException(`Insufficient rights to update form with ID: ${id}`);
    }
    return (await this.instrumentsRepository.updateById(id, update))!;
  }
}
