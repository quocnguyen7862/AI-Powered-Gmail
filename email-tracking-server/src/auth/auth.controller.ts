import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  async googleAuth() {
    const authUrl = await this.authService.getAuthUrl();
    return authUrl;
  }

  @Get('google/callback')
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { code } = req.query;
    const { access_token, refresh_token, refresh_token_expires_in, user } =
      await this.authService.exchangeGoogleCodeForToken(code as string);
    const sessionId = await this.authService.createSession(
      user,
      access_token,
      refresh_token,
      refresh_token_expires_in,
    );

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: refresh_token_expires_in,
    });
  }

  @Get('email-status')
  async getEmailStatus(
    @Query('emailId') emailId: string,
  ): Promise<{ isRead: boolean }> {
    const isRead = await this.authService.getEmailStatus('me', emailId);
    return { isRead };
  }

  @Get('list-emails')
  async listEmails(): Promise<any[]> {
    return this.authService.listEmails('me');
  }

  @Get('get-email')
  async getEmail(@Query('emailId') emailId: string): Promise<any> {
    return this.authService.getEmail('me', emailId);
  }

  @Get('mark-as-read')
  async markEmailAsRead(@Query('emailId') emailId: string): Promise<string> {
    await this.authService.markEmailAsRead('me', emailId);
    return 'Email marked as read';
  }

  @Get('user-info')
  async getUserInfo(): Promise<any> {
    const data = await this.authService.getUserInfo();
    return data;
  }
}
