import { ApiProperty } from '@nestjs/swagger';

import {
  type FormInstrumentData,
  FormInstrumentRecord,
  type SubjectIdentificationData,
  subjectIdentificationDataSchema
} from '@douglasneuroinformatics/common';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

interface CreateFormRecordData extends Omit<FormInstrumentRecord, 'group' | 'instrument' | 'subject'> {
  groupName?: string;
  instrumentName: string;
  instrumentVersion: number;
  subjectInfo: SubjectIdentificationData;
}

@ValidationSchema<CreateFormRecordData>({
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      const: 'form'
    },
    time: {
      type: 'number',
      minimum: 0
    },
    instrumentName: {
      type: 'string',
      minLength: 1
    },
    instrumentVersion: {
      type: 'number'
    },
    groupName: {
      type: 'string',
      minLength: 1,
      nullable: true
    },
    subjectInfo: subjectIdentificationDataSchema,
    data: {
      type: 'object',
      required: []
    }
  },
  required: ['kind', 'time', 'instrumentName', 'instrumentVersion', 'subjectInfo', 'data']
})
export class CreateFormRecordDto implements CreateFormRecordData {
  @ApiProperty()
  kind: 'form';

  @ApiProperty()
  time: number;

  @ApiProperty()
  instrumentName: string;

  @ApiProperty()
  instrumentVersion: number;

  @ApiProperty()
  groupName?: string;

  @ApiProperty()
  subjectInfo: SubjectIdentificationData;

  @ApiProperty()
  data: FormInstrumentData;
}
