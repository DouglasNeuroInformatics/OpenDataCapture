import { ApiProperty } from '@nestjs/swagger';

import { type FormInstrumentData, FormInstrumentRecord } from '@ddcp/common/instruments';
import { type SubjectIdentificationData, subjectIdentificationDataSchema } from '@ddcp/common/subjects';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

interface CreateFormRecordData
  extends Omit<FormInstrumentRecord, 'dateCollected' | 'group' | 'instrument' | 'subject'> {
  dateCollected: string;
  groupId?: string;
  instrumentId: string;
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
    instrumentId: {
      type: 'string',
      minLength: 24,
      maxLength: 24
    },
    groupId: {
      type: 'string',
      minLength: 24,
      maxLength: 24,
      nullable: true
    },
    subjectInfo: subjectIdentificationDataSchema,
    data: {
      type: 'object',
      required: []
    }
  },
  required: ['kind', 'dateCollected', 'instrumentId', 'subjectInfo', 'data']
})
export class CreateFormRecordDto implements CreateFormRecordData {
  @ApiProperty()
  kind: 'form';

  @ApiProperty()
  dateCollected: string;

  @ApiProperty()
  instrumentId: string;

  @ApiProperty()
  groupId?: string;

  @ApiProperty()
  subjectInfo: SubjectIdentificationData;

  @ApiProperty()
  data: FormInstrumentData;
}
