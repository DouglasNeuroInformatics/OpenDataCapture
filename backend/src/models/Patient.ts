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
  },
  dateAdded: {
    default: Date.now,
    type: Date,
    required: true
  }
});

patientSchema.methods.printFullName = function(): void {
  console.log(this.firstName + ' ' + this.lastName);
};

type PatientType = InferSchemaType<typeof patientSchema>;

const Patient = model('Patient', patientSchema);

export { Patient as default, PatientType };