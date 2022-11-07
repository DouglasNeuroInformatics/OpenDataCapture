import { model, Schema, InferSchemaType } from 'mongoose';

const patientSchema = new Schema({
  firstName: {
    required: true,
    type: String
  },
  lastName: {
    required: true,
    type: String
  },
  dateOfBirth: {
    required: true,
    type: Date
  },
  sex: {
    required: true,
    type: String
  }
});

type PatientType = InferSchemaType<typeof patientSchema>;

const Patient = model('Patient', patientSchema);

export { Patient as default, PatientType };