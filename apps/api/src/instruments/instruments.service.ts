import { InjectRepository, type Repository } from '@douglasneuroinformatics/nestjs/modules';
import { Injectable } from '@nestjs/common';
import { ConflictException, UnprocessableEntityException } from '@nestjs/common/exceptions';
import { type Instrument, formInstrumentSchema } from '@open-data-capture/common/instrument';
import { evaluateInstrument } from '@open-data-capture/instrument-runtime';
import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';

import { InstrumentSourceEntity } from './entities/instrument-source.entity';

import type { CreateInstrumentDto } from './dto/create-instrument.dto';

@Injectable()
export class InstrumentsService {
  private readonly instrumentTransformer = new InstrumentTransformer();

  constructor(
    @InjectRepository(InstrumentSourceEntity) private readonly instrumentsRepository: Repository<InstrumentSourceEntity>
  ) {}

  async create({ source }: CreateInstrumentDto): Promise<InstrumentSourceEntity> {
    const { instance } = await this.parseSource(source, formInstrumentSchema);
    if (await this.instrumentsRepository.exists({ name: instance.name })) {
      throw new ConflictException(`Instrument with name '${instance.name}' already exists!`);
    }
    return this.instrumentsRepository.create({ name: instance.name, source });
  }

  /**
   * Attempt to resolve an instance of an instrument from the TypeScript source code.
   * If this fails, then throws an UnprocessableContentException
   */
  private async parseSource<T extends Instrument>(source: string, schema: Zod.ZodType<T>) {
    let bundle: string;
    let instance: unknown;
    try {
      bundle = await this.instrumentTransformer.generateBundle(source);
      instance = evaluateInstrument(bundle);
    } catch (err) {
      throw new UnprocessableEntityException('Failed to parse instrument', {
        cause: err
      });
    }
    const result = await schema.safeParseAsync(instance);
    if (!result.success) {
      throw new UnprocessableEntityException(
        'Successfully parsed instrument, but resolved object does not conform to expected format',
        {
          cause: result.error
        }
      );
    }
    return { bundle, instance: result.data };
  }
}
