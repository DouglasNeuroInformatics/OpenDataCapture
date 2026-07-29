import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import type { Language } from '@opendatacapture/schemas/core';
import { $SendAssignmentEmailData } from '@opendatacapture/schemas/mail';
import type { SendAssignmentEmailData } from '@opendatacapture/schemas/mail';

@ValidationSchema($SendAssignmentEmailData)
export class SendAssignmentEmailDto implements SendAssignmentEmailData {
  @ApiProperty({ description: 'The language to send the email in', enum: ['en', 'fr'] })
  language: Language;

  @ApiProperty({ description: "The participant's email address" })
  recipient: string;

  @ApiProperty({
    description: 'Template id to use; null for the built-in default, omitted to use the group active template',
    required: false
  })
  templateId?: null | string;
}
