import { ApiProperty } from '@nestjs/swagger';

import { type FormInstrumentData, FormInstrumentRecord } from '@ddcp/common';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

interface CreateFormRecordData
  extends Omit<FormInstrumentRecord, 'dateCollected' | 'group' | 'instrument' | 'subject'> {
  dateCollected: string;
  groupId?: string;
  instrumentId: string;
  subjectIdentifier: string;
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
    subjectIdentifier: {
      type: 'string',
      minLength: 64,
      maxLength: 64
    },
    data: {
      type: 'object',
      required: []
    }
  },
  required: ['kind', 'dateCollected', 'instrumentId', 'subjectIdentifier', 'data']
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
  subjectIdentifier: string;

  @ApiProperty()
  data: FormInstrumentData;
}
