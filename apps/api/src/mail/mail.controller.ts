import { ApiOperation } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { $TestMailData, $UpdateMailSettingsData } from '@opendatacapture/schemas/mail';
import type { MailSettings, TestMailResult } from '@opendatacapture/schemas/mail';

import { ADMIN_ONLY, RouteAccess } from '@/core/decorators/route-access.decorator';

import { MailService } from './mail.service';

@Controller({ path: 'mail' })
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({
    description: 'Get the mail configuration (without the SMTP password) and templates',
    summary: 'Get Mail Settings'
  })
  @Get('settings')
  @RouteAccess(ADMIN_ONLY)
  getSettings(): Promise<MailSettings> {
    return this.mailService.getSettings();
  }

  @ApiOperation({ description: 'Verify the SMTP connection and optionally send a test email', summary: 'Test Mail' })
  @Post('test')
  @RouteAccess(ADMIN_ONLY)
  test(@Body() data: $TestMailData): Promise<TestMailResult> {
    return this.mailService.test(data);
  }

  @ApiOperation({ description: 'Update the mail configuration and/or templates', summary: 'Update Mail Settings' })
  @Patch('settings')
  @RouteAccess(ADMIN_ONLY)
  updateSettings(@Body() data: $UpdateMailSettingsData): Promise<MailSettings> {
    return this.mailService.updateSettings(data);
  }
}
