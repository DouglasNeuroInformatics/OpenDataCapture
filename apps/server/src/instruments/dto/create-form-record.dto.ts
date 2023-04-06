import { ApiProperty } from '@nestjs/swagger';

import { type FormInstrumentData, FormInstrumentRecord } from '@ddcp/common/instruments';
import { type SubjectIdentificationData, subjectIdentificationDataSchema } from '@ddcp/common/subjects';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

interface CreateFormRecordData
  extends Omit<FormInstrumentRecord, 'dateCollected' | 'group' | 'instrument' | 'subject'> {
  dateCollected: string;
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
    dateCollected: {
      type: 'string',
      format: 'date'
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
  required: ['kind', 'dateCollected', 'instrumentName', 'instrumentVersion', 'subjectInfo', 'data']
})
export class CreateFormRecordDto implements CreateFormRecordData {
  @ApiProperty()
  kind: 'form';

  @ApiProperty()
  dateCollected: string;

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
