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
}
