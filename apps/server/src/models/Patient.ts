import { model, Schema, InferSchemaType } from 'mongoose';

const patientSchema = new Schema(
  {
    _id: {
      required: true,
      type: String
    },
    firstName: {
      required: true,
      trim: true,
      type: String
    },
    lastName: {
      required: true,
      trim: true,
      type: String
    },
    dateOfBirth: {
      required: true,
      type: Date
    },
    sex: {
      required: true,
      type: String,
      enum: ['male', 'female']
    }
  },
  {
    strict: 'throw',
    timestamps: true
  }
);

type PatientType = InferSchemaType<typeof patientSchema>;

const Patient = model('Patient', patientSchema);

export { Patient as default, type PatientType };
