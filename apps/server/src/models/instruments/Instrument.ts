import { model, Schema, InferSchemaType, SchemaOptions } from 'mongoose';

const instrumentOptions: SchemaOptions = {
  discriminatorKey: 'kind',
  strict: 'throw',
  timestamps: true
};

const instrumentSchema = new Schema(
  {
    subjectId: {
      required: true,
      type: String
    }
  },
  instrumentOptions
);

type InstrumentType = InferSchemaType<typeof instrumentSchema>;

const Instrument = model('Instrument', instrumentSchema);

export { Instrument as default, instrumentOptions, type InstrumentType };
