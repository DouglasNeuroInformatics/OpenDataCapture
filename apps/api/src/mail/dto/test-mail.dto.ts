import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $TestMailData } from '@opendatacapture/schemas/mail';
import type { TestMailData, UpdateMailConfigData } from '@opendatacapture/schemas/mail';

@ValidationSchema($TestMailData)
export class TestMailDto implements TestMailData {
  @ApiProperty({
    description: 'The (possibly unsaved) configuration to test; omit to test the saved one',
    required: false
  })
  config?: UpdateMailConfigData;

  @ApiProperty({ description: 'If provided, a real test email is delivered to this address', required: false })
  recipient?: string;
}
