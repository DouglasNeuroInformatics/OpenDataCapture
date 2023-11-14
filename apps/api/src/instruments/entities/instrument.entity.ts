import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { evaluateInstrument } from '@open-data-capture/common/instrument';
import type * as Types from '@open-data-capture/common/instrument';
import { InstrumentTransformer } from '@open-data-capture/common/instrument';
import type { HydratedDocument } from 'mongoose';

const instrumentTransformer = new InstrumentTransformer();

@EntitySchema({
  toObject: {
    transform: (_, ret) => {
      delete ret._source;
    },
    virtuals: true
  },
  virtuals: {
    content: {
      get(this: InstrumentDocument) {
        return evaluateInstrument(this.bundle).content;
      }
    },
    measures: {
      get(this: InstrumentDocument) {
        return evaluateInstrument(this.bundle).measures;
      }
    },
    source: {
      get(this: InstrumentDocument) {
        return this._source;
      },
      set(this: InstrumentDocument, source: string) {
        const bundle = instrumentTransformer.generateBundle(source);
        const instance = evaluateInstrument(bundle);
        this.set({
          ...instance,
          _source: source,
          bundle,
          details: instance.details,
          language: instance.language,
          name: instance.name,
          tags: instance.tags,
          version: instance.version
        });
      }
    },
    validationSchema: {
      get(this: InstrumentDocument) {
        return evaluateInstrument(this.bundle).validationSchema;
      }
    }
  }
})
export class InstrumentEntity<TData = unknown, TLanguage extends Types.InstrumentLanguage = Types.InstrumentLanguage>
  implements Types.BaseInstrument<TData, TLanguage>
{
  static readonly modelName = 'Instrument';

  @Prop({ required: true })
  bundle: string;

  content: unknown;

  @Prop({ required: true, type: Object })
  details: Types.BaseInstrumentDetails<TLanguage>;

  @Prop({ enum: ['form'] satisfies Types.InstrumentKind[], required: true, type: String })
  kind: Types.InstrumentKind;

  @Prop({ required: true, type: Object })
  language: TLanguage;

  measures?: unknown;

  @Prop({ required: true, unique: true })
  name: string;

  source: string;

  @Prop({ required: true, type: Object })
  tags: Types.InstrumentUIOption<TLanguage, string[]>;

  validationSchema: Zod.ZodType<TData>;

  @Prop({ required: true })
  version: number;

  @Prop({ required: true })
  private _source: string;
}

export type InstrumentDocument = HydratedDocument<InstrumentEntity>;

export const InstrumentSchema = SchemaFactory.createForClass(InstrumentEntity);
