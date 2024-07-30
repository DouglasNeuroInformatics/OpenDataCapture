import { CryptoService } from '@douglasneuroinformatics/libnest/modules';
import { Injectable, Logger } from '@nestjs/common';
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common/exceptions';
import { isScalarInstrument } from '@opendatacapture/instrument-utils';
import type { WithID } from '@opendatacapture/schemas/core';
import type {
  AnyInstrument,
  AnyScalarInstrument,
  InstrumentBundleContainer,
  InstrumentKind,
  InstrumentSummary,
  SeriesInstrument,
  SomeInstrument
} from '@opendatacapture/schemas/instrument';

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
  private readonly logger = new Logger(InstrumentsService.name);

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
    let instance: AnyInstrument;
    try {
      instance = await this.virtualizationService.runInContext(bundle, { validate: true });
    } catch (err) {
      this.logger.error(err);
      throw new UnprocessableEntityException('Failed to interpret instrument bundle', {
        cause: err
      });
    }

    const id = this.generateInstrumentId(instance);
    if (await this.instrumentModel.exists({ id })) {
      throw new ConflictException(`Instrument with ID '${instance.id}' already exists!`);
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

  private generateScalarInstrumentId({ internal: { edition, name } }: AnyScalarInstrument) {
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
}
