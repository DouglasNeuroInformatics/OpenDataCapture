import { model, Schema, InferSchemaType } from 'mongoose';

const patientSchema = new Schema({
  _id: {
    required: true,
    type: String
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
  },
  dateAdded: {
    default: Date.now,
    type: Date,
    required: true,
  },
});

type PatientType = InferSchemaType<typeof patientSchema>;

patientSchema.statics.deleteById = function (_id): PatientType {
  return this.deleteOne({ _id: _id })
};

patientSchema.methods.printFullName = function (): void {
  console.log(this.firstName + ' ' + this.lastName);
};

const Patient = model('Patient', patientSchema);

export { Patient as default, PatientType };
