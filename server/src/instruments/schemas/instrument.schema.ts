import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  InstrumentField as InstrumentFieldInterface,
  InstrumentFieldType,
  Instrument as InstrumentInterface,
  instrumentFieldTypeOptions
} from 'common';
import { HydratedDocument } from 'mongoose';

@Schema({ strict: true })
export class InstrumentField implements InstrumentFieldInterface {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  isRequired: boolean;

  @Prop({ enum: instrumentFieldTypeOptions, required: true })
  type: InstrumentFieldType;
}

@Schema({ strict: true, timestamps: true })
export class Instrument implements InstrumentInterface {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  instructions: string;

  @Prop({ required: true })
  language: 'en' | 'fr';

  @Prop({ required: false })
  estimatedDuration: number;

  @Prop({ required: false })
  version: number;

  // PyMongo docs
  // Date collected vs added

  // Clinic for instrument records
  // Data instead of fields
  // Type - Form or
  @Prop({ required: true, type: Array })
  fields: InstrumentField[];
}

export type InstrumentDocument = HydratedDocument<Instrument>;

export const InstrumentSchema = SchemaFactory.createForClass(Instrument);
