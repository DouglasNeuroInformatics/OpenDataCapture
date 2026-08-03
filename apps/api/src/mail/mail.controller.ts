import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { MailSettings, TestMailResult } from '@opendatacapture/schemas/mail';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { TestMailDto } from './dto/test-mail.dto';
import { UpdateMailSettingsDto } from './dto/update-mail-settings.dto';
import { MailService } from './mail.service';

@ApiTags('Mail')
@Controller({ path: 'mail' })
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({
    description: 'Get the mail configuration (without the SMTP password) and templates',
    summary: 'Get Mail Settings'
  })
  @Get('settings')
  @RouteAccess({ action: 'manage', subject: 'all' })
  getSettings(): Promise<MailSettings> {
    return this.mailService.getSettings();
  }

  @ApiOperation({ description: 'Verify the SMTP connection and optionally send a test email', summary: 'Test Mail' })
  @Post('test')
  @RouteAccess({ action: 'manage', subject: 'all' })
  test(@Body() data: TestMailDto): Promise<TestMailResult> {
    return this.mailService.test(data);
  }

  @ApiOperation({ description: 'Update the mail configuration and/or templates', summary: 'Update Mail Settings' })
  @Patch('settings')
  @RouteAccess({ action: 'manage', subject: 'all' })
  updateSettings(@Body() data: UpdateMailSettingsDto): Promise<MailSettings> {
    return this.mailService.updateSettings(data);
  }
}
