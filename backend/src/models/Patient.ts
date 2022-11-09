import { model, Schema, InferSchemaType } from 'mongoose';

const patientSchema = new Schema({
  _id: {
    required: true,
    type: String,
  },
  firstName: {
    required: true,
    type: String,
  },
  lastName: {
    required: true,
    type: String,
  },
  dateOfBirth: {
    required: true,
    type: Date,
  },
  sex: {
    required: true,
    type: String,
    enum: ['Male', 'Female']
  },
  dateAdded: {
    default: Date.now,
    type: Date,
    required: true,
  },
});

type PatientType = InferSchemaType<typeof patientSchema>;

const Patient = model('Patient', patientSchema);

export { Patient as default, PatientType };
