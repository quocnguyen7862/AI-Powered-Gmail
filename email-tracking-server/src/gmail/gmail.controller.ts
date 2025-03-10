import { Controller, Get, Query, Res } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { Response } from 'express';

@Controller('gmail')
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Get('auth')
  async googleAuth(@Res() res: Response) {
    const authUrl = await this.gmailService.getAuthUrl();
    return res.redirect(authUrl);
  }

  @Get('auth/callback')
  async googleAuthCallback(@Query('code') code: string) {
    const tokens = await this.gmailService.getTokens(code);
    return tokens;
  }

  @Get('email-status')
  async getEmailStatus(
    @Query('emailId') emailId: string,
  ): Promise<{ isRead: boolean }> {
    const isRead = await this.gmailService.getEmailStatus('me', emailId);
    return { isRead };
  }

  @Get('list-emails')
  async listEmails(): Promise<any[]> {
    return this.gmailService.listEmails('me');
  }

  @Get('mark-as-read')
  async markEmailAsRead(@Query('emailId') emailId: string): Promise<string> {
    await this.gmailService.markEmailAsRead('me', emailId);
    return 'Email marked as read';
  }
}
