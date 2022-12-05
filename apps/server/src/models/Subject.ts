import { model, Schema, InferSchemaType } from 'mongoose';

const subjectSchema = new Schema(
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

type SubjectType = InferSchemaType<typeof subjectSchema>;

const Subject = model('Subject', subjectSchema);

export { Subject as default, type SubjectType };
