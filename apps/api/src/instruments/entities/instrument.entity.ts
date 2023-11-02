import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { evaluateInstrument } from '@open-data-capture/common/instrument';
import type * as Types from '@open-data-capture/common/instrument';
import type { HydratedDocument } from 'mongoose';

@EntitySchema({
  methods: {
    generateBundle(source: string) {
      const transpiler = new Bun.Transpiler({
        deadCodeElimination: false,
        loader: 'tsx',
        minifyWhitespace: true,
        target: 'browser'
      });

      // Throw an error if the source code contains any imports or non-default exports
      const { exports, imports } = transpiler.scan(source);
      if (imports.length > 0) {
        throw new Error(`Unexpected import token '${imports[0]!.kind}' with path '${imports[0]!.path}'`);
      } else if (exports.length !== 1 || exports[0] !== 'default') {
        throw new Error(
          `Unexpected non-default exports: ${exports
            .filter((s) => s !== 'default')
            .map((s) => `'${s}'`)
            .join(', ')}`
        );
      }

      let output = source;
      output = output.replace('export default', 'const __instrument__ =');
      output = `(({ z }) => {
        ${output}
        return __instrument__
      })`;
      output = transpiler.transformSync(output);
      return output;
    }
  },
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
    source: {
      get(this: InstrumentDocument) {
        return this._source;
      },
      set(this: InstrumentDocument, source: string) {
        const bundle = this.generateBundle(source);
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

  @Prop({ required: true, unique: true })
  name: string;

  source: string;

  @Prop({ required: true, type: Object })
  tags: Types.InstrumentUIOption<TLanguage, string[]>;

  validationSchema: Zod.ZodType<TData>;

  @Prop({ required: true })
  version: number;

  @Prop({
    required: true,
    select: false
  })
  private _source: string;

  private generateBundle: (source: string) => string;
}

export type InstrumentDocument = HydratedDocument<InstrumentEntity>;

export const InstrumentSchema = SchemaFactory.createForClass(InstrumentEntity);
