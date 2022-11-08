import { ObjectId } from 'mongodb';
import { model, Schema } from 'mongoose';

const happinessQuestionnaireSchema = new Schema({
  patient: ObjectId,
  score: Number
}, {
  timestamps: true
});

const HappinessQuestionnaire = model('HappinessQuestionnaire', happinessQuestionnaireSchema);

export default HappinessQuestionnaire;
