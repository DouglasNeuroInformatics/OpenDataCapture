import { model, Schema } from 'mongoose';

const happinessQuestionnaireSchema = new Schema(
  {
    patientId: String,
    score: Number,
  },
  {
    timestamps: true,
  }
);

const HappinessQuestionnaire = model('HappinessQuestionnaire', happinessQuestionnaireSchema);

export default HappinessQuestionnaire;
