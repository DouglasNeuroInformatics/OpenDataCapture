import { model, Schema, InferSchemaType } from 'mongoose';

import Instrument, { instrumentOptions } from './Instrument';

const happinessQuestionnaireSchema = new Schema(
  {
    score: {
      required: true,
      type: Number,
    },
  },
  instrumentOptions
);

const HappinessQuestionnaire = Instrument.discriminator(
  'HappinessQuestionnaire',
  happinessQuestionnaireSchema
);

export default HappinessQuestionnaire;
