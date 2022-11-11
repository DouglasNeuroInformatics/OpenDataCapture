import { model, Schema, InferSchemaType } from 'mongoose';

const baseInstrumentSchema = new Schema(
  {
    patientId: {
      required: true,
      type: String,
    },
  },
  {
    discriminatorKey: 'name',
    strict: 'throw',
    timestamps: true,
  }
);

type BaseInstrumentType = InferSchemaType<typeof baseInstrumentSchema>;

const Instrument = model('BaseInstrument', baseInstrumentSchema);

export { Instrument as default, BaseInstrumentType };
