import { CryptoService } from '@douglasneuroinformatics/libnest/modules';
import { Injectable } from '@nestjs/common';
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common/exceptions';
import { isScalarInstrument } from '@opendatacapture/instrument-utils';
import type {
  AnyInstrument,
  AnyScalarInstrument,
  InstrumentKind,
  InstrumentSummary,
  SeriesInstrument,
  SomeInstrument
} from '@opendatacapture/runtime-core';
import { $Error, type WithID } from '@opendatacapture/schemas/core';
import { $AnyInstrument } from '@opendatacapture/schemas/instrument';
import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';
import { VirtualizationService } from '@/virtualization/virtualization.service';

import { CreateInstrumentDto } from './dto/create-instrument.dto';

type InstrumentQuery<TKind extends InstrumentKind> = {
  kind?: TKind;
  subjectId?: string;
};

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectModel('Instrument') private readonly instrumentModel: Model<'Instrument'>,
    private readonly cryptoService: CryptoService,
    private readonly virtualizationService: VirtualizationService
  ) {}

  async count<TKind extends InstrumentKind>(
    query: InstrumentQuery<TKind> = {},
    options: EntityOperationOptions = {}
  ): Promise<number> {
    return (await this.find(query, options)).length;
  }

  async create({ bundle }: CreateInstrumentDto): Promise<WithID<AnyInstrument>> {
    let bundleReturn: unknown;
    try {
      bundleReturn = await this.virtualizationService.runInContext(bundle);
    } catch (err) {
      let cause: unknown;
      const parsed = await $Error.safeParseAsync(err);
      if (parsed.success) {
        cause = { message: parsed.data.message, name: parsed.data.name };
      }
      throw new UnprocessableEntityException({
        cause,
        message: 'Failed to interpret instrument bundle'
      });
    }

    const parseResult = await $AnyInstrument.safeParseAsync(bundleReturn);
    if (!parseResult.success) {
      throw new UnprocessableEntityException({
        issues: parseResult.error.issues,
        message: 'Instrument validation failed'
      });
    }
    const instance = parseResult.data;

    const id = this.generateInstrumentId(instance);
    if (await this.instrumentModel.exists({ id })) {
      throw new ConflictException(`Instrument with ID '${id}' already exists!`);
    }

    if (instance.kind === 'SERIES') {
      const result = await this.validateSeriesInstrument(instance);
      if (!result.success) {
        throw new UnprocessableEntityException(result.message);
      }
    }

    await this.instrumentModel.create({ data: { bundle, id } });
    return { ...instance, id };
  }

  async find<TKind extends InstrumentKind>(
    query: InstrumentQuery<TKind> = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<WithID<SomeInstrument<TKind>>[]> {
    const instruments = await this.instrumentModel.findMany({
      where: {
        AND: [
          {
            records: query.subjectId
              ? {
                  some: {
                    subjectId: query.subjectId
                  }
                }
              : undefined
          },
          accessibleQuery(ability, 'read', 'Instrument')
        ]
      }
    });
    const instances = await this.instantiate(instruments);
    if (!query.kind) {
      return instances as WithID<SomeInstrument<TKind>>[];
    }
    return instances.filter((instance) => instance.kind === query.kind) as WithID<SomeInstrument<TKind>>[];
  }

  async findById(
    id: string,
    { ability }: EntityOperationOptions = {}
  ): Promise<{ bundle: string; id: string } & AnyInstrument> {
    const instrument = await this.instrumentModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument')], id }
    });
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    }
    return { bundle: instrument.bundle, ...(await this.virtualizationService.getInstrumentInstance(instrument)) };
  }

  async findSummaries<TKind extends InstrumentKind>(
    query: InstrumentQuery<TKind> = {},
    options: EntityOperationOptions = {}
  ): Promise<InstrumentSummary[]> {
    const instances = await this.find(query, options);
    return instances.map(({ details, id, kind, language, tags }) => ({ details, id, kind, language, tags }));
  }

  private generateInstrumentId(instrument: AnyInstrument) {
    if (isScalarInstrument(instrument)) {
      return this.generateScalarInstrumentId(instrument);
    }
    return this.generateSeriesInstrumentId(instrument);
  }

  private generateScalarInstrumentId({ internal: { edition, name } }: Pick<AnyScalarInstrument, 'internal'>) {
    return this.cryptoService.hash(`${name}-${edition}`);
  }

  private generateSeriesInstrumentId(instrument: SeriesInstrument) {
    return this.cryptoService.hash(instrument.content.map(({ edition, name }) => `${name}-${edition}`).join('--'));
  }

  private async instantiate(instruments: InstrumentBundleContainer[]) {
    return Promise.all(
      instruments.map((instrument) => {
        return this.virtualizationService.getInstrumentInstance(instrument);
      })
    );
  }

  private async validateSeriesInstrument(instrument: SeriesInstrument) {
    if (instrument.content.length < 2) {
      return { message: 'Series instrument must include at least two items', success: false };
    }
    for (const internal of instrument.content) {
      const id = this.generateScalarInstrumentId({ internal });
      const exists = await this.instrumentModel.exists({ id });
      if (!exists) {
        return {
          message: `Cannot find instrument '${internal.name}' with edition '${internal.edition}'`,
          success: false
        };
      }
    }
    return { success: true };
  }
}
