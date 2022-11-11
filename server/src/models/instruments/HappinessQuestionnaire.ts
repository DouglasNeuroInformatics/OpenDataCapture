import { model, Schema, InferSchemaType } from 'mongoose';

const happinessQuestionnaireSchema = new Schema(
  {
    score: {
      required: true,
      type: Number,
    },
  },
  {
    discriminatorKey: 'name',
    strict: 'throw',
    timestamps: true,
  }
);

type HappinessQuestionnaireType = InferSchemaType<typeof happinessQuestionnaireSchema>;

const HappinessQuestionnaire = model('HappinessQuestionnaire', happinessQuestionnaireSchema);

export { HappinessQuestionnaire as default, HappinessQuestionnaireType };
